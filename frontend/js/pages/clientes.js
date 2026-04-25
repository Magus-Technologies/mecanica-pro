/* ══════════════════════════════════════════════════════════════
   clientes.js
══════════════════════════════════════════════════════════════ */
async function renderClientes(el) {
  el.innerHTML = `
    <div class="page-header"><h1 class="page-title">Clientes <span>CRM</span></h1>
      <button class="btn btn-orange" onclick="modalCliente()">+ Nuevo cliente</button></div>
    <div class="filters-bar">
      <div class="search-input" style="flex:1">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        <input class="form-control" placeholder="Buscar por nombre, documento o teléfono…" id="cliSearch">
      </div>
    </div>
    <div class="card">
      <div class="table-wrap">
        <table>
          <thead><tr><th>Nombre</th><th>Documento</th><th>Teléfono</th><th>Tipo</th><th>OTs</th><th>Total gastado</th><th></th></tr></thead>
          <tbody id="cliTbody">${skeletonRows(7)}</tbody>
        </table>
      </div>
    </div>`;
  loadClientes();
  document.getElementById('cliSearch').addEventListener('input', e => loadClientes(e.target.value));
}

async function loadClientes(q='') {
  const data = await Api.get(`/clientes?q=${encodeURIComponent(q)}&limit=50`);
  const tbody = document.getElementById('cliTbody');
  if (!data?.success) return;
  if (!data.data.length) { tbody.innerHTML = `<tr><td colspan="7">${emptyState('Sin clientes')}</td></tr>`; return; }
  tbody.innerHTML = data.data.map(c=>`
    <tr>
      <td class="fw600">${c.nombre}</td>
      <td class="text-muted">${c.tipo_documento||''} ${c.documento||''}</td>
      <td>
        ${c.telefono ? `<a href="${waLink(c.telefono,'Hola!')}" target="_blank" class="text-green">💬 ${c.telefono}</a>` : '—'}
      </td>
      <td>${c.tipo_cliente==='empresa'?'🏢 Empresa':'👤 Natural'}</td>
      <td class="text-center fw600">${c.total_ots||0}</td>
      <td class="fw600 text-accent">${fmtCurrency(c.total_gastado)}</td>
      <td style="display:flex;gap:6px">
        <button class="btn-icon" onclick="verCliente(${c.id})" title="Ver"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>
        <button class="btn-icon" onclick="modalCliente(${c.id})" title="Editar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
      </td>
    </tr>`).join('');
}

async function verCliente(id) {
  const data = await Api.get(`/clientes/${id}`);
  if (!data?.success) return;
  const c = data.data;
  openModal(`
    <div class="modal-header"><h3>${c.nombre}</h3><button class="modal-close btn-icon">✕</button></div>
    <div class="modal-body">
      <div class="grid2 mb16">
        <div><div class="text-muted" style="font-size:.78rem">DOCUMENTO</div><div>${c.tipo_documento} ${c.documento||'—'}</div></div>
        <div><div class="text-muted" style="font-size:.78rem">TELÉFONO</div><div>${c.telefono||'—'}</div></div>
        <div><div class="text-muted" style="font-size:.78rem">EMAIL</div><div>${c.email||'—'}</div></div>
        <div><div class="text-muted" style="font-size:.78rem">DIRECCIÓN</div><div>${c.direccion||'—'}</div></div>
      </div>
      <div class="fw600 mb8">Vehículos (${c.vehiculos?.length||0})</div>
      ${c.vehiculos?.length ? `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">${c.vehiculos.map(v=>`<div style="background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:10px 14px;font-size:.85rem"><div class="fw700 text-accent">${v.placa}</div><div>${v.marca||''} ${v.modelo||''}</div><div class="text-muted">${v.tipo}</div></div>`).join('')}</div>` : '<p class="text-muted mb16" style="font-size:.85rem">Sin vehículos</p>'}
      <div class="fw600 mb8">Historial de OTs</div>
      ${c.historial?.length ? `<table><thead><tr><th>Código</th><th>Estado</th><th>Total</th><th>Fecha</th></tr></thead><tbody>
        ${c.historial.map(o=>`<tr><td class="text-accent fw600">${o.codigo}</td><td>${badgeEstado(o.estado)}</td><td>${fmtCurrency(o.total_real)}</td><td class="text-muted">${fmtDate(o.created_at)}</td></tr>`).join('')}
      </tbody></table>` : '<p class="text-muted" style="font-size:.85rem">Sin órdenes</p>'}
    </div>
    <div class="modal-footer">
      ${c.telefono?`<a class="btn btn-green" href="${waLink(c.telefono,'Hola!')}" target="_blank">💬 WhatsApp</a>`:''}
      <button class="btn btn-ghost" onclick="closeModal()">Cerrar</button>
    </div>`, 'modal-lg');
}

async function modalCliente(id=null) {
  let c = {};
  if (id) { const d = await Api.get(`/clientes/${id}`); c = d?.data||{}; }
  openModal(`
    <div class="modal-header"><h3>${id?'Editar':'Nuevo'} Cliente</h3><button class="modal-close btn-icon">✕</button></div>
    <div class="modal-body">
      <div class="form-group"><label>Nombre *</label><input class="form-control" id="cNombre" value="${c.nombre||''}"></div>
      <div class="form-row">
        <div class="form-group"><label>Tipo documento</label><select class="form-control" id="cTipoDoc"><option ${c.tipo_documento==='DNI'?'selected':''}>DNI</option><option ${c.tipo_documento==='RUC'?'selected':''}>RUC</option><option ${c.tipo_documento==='CE'?'selected':''}>CE</option></select></div>
        <div class="form-group"><label>Documento</label><input class="form-control" id="cDoc" value="${c.documento||''}"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Teléfono</label><input class="form-control" id="cTel" value="${c.telefono||''}"></div>
        <div class="form-group"><label>Email</label><input class="form-control" id="cEmail" value="${c.email||''}"></div>
      </div>
      <div class="form-group"><label>Dirección</label><input class="form-control" id="cDir" value="${c.direccion||''}"></div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-orange" onclick="guardarCliente(${id||'null'})">Guardar</button>
    </div>`);
}

async function guardarCliente(id) {
  const body = {
    nombre: document.getElementById('cNombre').value.trim(),
    tipo_documento: document.getElementById('cTipoDoc').value,
    documento: document.getElementById('cDoc').value.trim()||null,
    telefono: document.getElementById('cTel').value.trim()||null,
    email: document.getElementById('cEmail').value.trim()||null,
    direccion: document.getElementById('cDir').value.trim()||null,
  };
  if (!body.nombre) { toast('Nombre requerido','warning'); return; }
  const data = id ? await Api.put(`/clientes/${id}`,body) : await Api.post('/clientes',body);
  if (data?.success) { toast(`Cliente ${id?'actualizado':'creado'}`,'success'); closeModal(); loadClientes(); }
  else toast(data?.message||'Error','error');
}


/* ══════════════════════════════════════════════════════════════
   vehiculos.js
══════════════════════════════════════════════════════════════ */
async function renderVehiculos(el) {
  el.innerHTML = `
    <div class="page-header"><h1 class="page-title">Vehículos</h1>
      <button class="btn btn-orange" onclick="modalVehiculo()">+ Nuevo vehículo</button></div>
    <div class="filters-bar">
      <div class="search-input" style="flex:1">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        <input class="form-control" placeholder="Buscar por placa, marca o modelo…" id="vSearch">
      </div>
    </div>
    <div class="card">
      <div class="table-wrap">
        <table>
          <thead><tr><th>Placa</th><th>Marca / Modelo</th><th>Tipo</th><th>Año</th><th>KM</th><th>Cliente</th><th></th></tr></thead>
          <tbody id="vTbody">${skeletonRows(7)}</tbody>
        </table>
      </div>
    </div>`;
  loadVehiculos();
  document.getElementById('vSearch').addEventListener('input', e => loadVehiculos(e.target.value));
}

async function loadVehiculos(q='') {
  const data = await Api.get(`/vehiculos?q=${encodeURIComponent(q)}&limit=50`);
  const tbody = document.getElementById('vTbody');
  if (!data?.success||!data.data.length) { tbody.innerHTML=`<tr><td colspan="7">${emptyState()}</td></tr>`; return; }
  tbody.innerHTML = data.data.map(v=>`
    <tr>
      <td class="fw700 text-accent">${v.placa}</td>
      <td><div class="fw600">${v.marca||'—'} ${v.modelo||''}</div><div class="text-muted" style="font-size:.75rem">${v.color||''} ${v.combustible||''}</div></td>
      <td><span class="badge badge-normal">${v.tipo}</span></td>
      <td>${v.anio||'—'}</td>
      <td>${(v.km_actual||0).toLocaleString()} km</td>
      <td>${v.cliente_nombre||'—'}</td>
      <td>
        <button class="btn-icon" onclick="modalVehiculo(${v.id})" title="Editar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
      </td>
    </tr>`).join('');
}

async function modalVehiculo(id=null) {
  const [vData, cliData] = await Promise.all([
    id ? Api.get(`/vehiculos/${id}`) : Promise.resolve(null),
    Api.get('/clientes?limit=200'),
  ]);
  const v = vData?.data||{};
  openModal(`
    <div class="modal-header"><h3>${id?'Editar':'Nuevo'} Vehículo</h3><button class="modal-close btn-icon">✕</button></div>
    <div class="modal-body">
      <div class="form-row">
        <div class="form-group"><label>Placa *</label><input class="form-control" id="vPlaca" value="${v.placa||''}" ${id?'disabled':''}></div>
        <div class="form-group"><label>Cliente *</label><select class="form-control" id="vCliente" ${id?'disabled':''}><option value="">Seleccionar…</option>${cliData?.data?.map(c=>`<option value="${c.id}" ${v.cliente_id==c.id?'selected':''}>${c.nombre}</option>`).join('')}</select></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Marca</label><input class="form-control" id="vMarca" value="${v.marca||''}"></div>
        <div class="form-group"><label>Modelo</label><input class="form-control" id="vModelo" value="${v.modelo||''}"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Año</label><input type="number" class="form-control" id="vAnio" value="${v.anio||''}" min="1950" max="2030"></div>
        <div class="form-group"><label>Tipo</label><select class="form-control" id="vTipo"><option value="auto" ${v.tipo==='auto'?'selected':''}>Auto</option><option value="moto" ${v.tipo==='moto'?'selected':''}>Moto</option><option value="camioneta" ${v.tipo==='camioneta'?'selected':''}>Camioneta</option><option value="camion" ${v.tipo==='camion'?'selected':''}>Camión</option></select></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Color</label><input class="form-control" id="vColor" value="${v.color||''}"></div>
        <div class="form-group"><label>KM actual</label><input type="number" class="form-control" id="vKm" value="${v.km_actual||0}"></div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-orange" onclick="guardarVehiculo(${id||'null'})">Guardar</button>
    </div>`);
}

async function guardarVehiculo(id) {
  const body = {
    placa: document.getElementById('vPlaca')?.value.toUpperCase(),
    cliente_id: document.getElementById('vCliente')?.value,
    marca: document.getElementById('vMarca').value,
    modelo: document.getElementById('vModelo').value,
    anio: document.getElementById('vAnio').value||null,
    tipo: document.getElementById('vTipo').value,
    color: document.getElementById('vColor').value,
    km_actual: parseInt(document.getElementById('vKm').value)||0,
  };
  const data = id ? await Api.put(`/vehiculos/${id}`,body) : await Api.post('/vehiculos',body);
  if (data?.success) { toast(`Vehículo ${id?'actualizado':'creado'}`,'success'); closeModal(); loadVehiculos(); }
  else toast(data?.message||'Error','error');
}


/* ══════════════════════════════════════════════════════════════
   inventario.js
══════════════════════════════════════════════════════════════ */
async function renderInventario(el) {
  el.innerHTML = `
    <div class="page-header"><h1 class="page-title">Inventario <span>/ Repuestos</span></h1>
      <button class="btn btn-orange" onclick="modalRepuesto()">+ Nuevo repuesto</button></div>
    <div class="filters-bar">
      <div class="search-input" style="flex:1">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        <input class="form-control" placeholder="Buscar por nombre o SKU…" id="invSearch">
      </div>
      <label style="display:flex;align-items:center;gap:6px;font-size:.85rem;color:var(--text2);cursor:pointer">
        <input type="checkbox" id="invAlerta"> Solo alertas de stock
      </label>
    </div>
    <div class="card">
      <div class="table-wrap">
        <table>
          <thead><tr><th>Nombre</th><th>SKU</th><th>Stock</th><th>Estado</th><th>P.Compra</th><th>P.Venta</th><th>Ubicación</th><th></th></tr></thead>
          <tbody id="invTbody">${skeletonRows(8)}</tbody>
        </table>
      </div>
    </div>`;
  loadInventario();
  document.getElementById('invSearch').addEventListener('input', () => loadInventario());
  document.getElementById('invAlerta').addEventListener('change', () => loadInventario());
}

async function loadInventario() {
  const q = document.getElementById('invSearch')?.value||'';
  const alerta = document.getElementById('invAlerta')?.checked?'1':'';
  const data = await Api.get(`/repuestos?q=${encodeURIComponent(q)}&alerta=${alerta}`);
  const tbody = document.getElementById('invTbody');
  if (!data?.success||!data.data.length) { tbody.innerHTML=`<tr><td colspan="8">${emptyState()}</td></tr>`; return; }
  tbody.innerHTML = data.data.map(r=>`
    <tr>
      <td class="fw600">${r.nombre}</td>
      <td class="text-muted">${r.sku||'—'}</td>
      <td class="${r.stock_actual<=r.stock_minimo?'text-red fw700':'fw600'}">${r.stock_actual} ${r.unidad}</td>
      <td><span class="badge badge-${r.estado_stock}">${r.estado_stock==='ok'?'OK':r.estado_stock==='critico'?'Crítico':'Sin stock'}</span></td>
      <td>${fmtCurrency(r.precio_compra)}</td>
      <td class="text-accent fw600">${fmtCurrency(r.precio_venta)}</td>
      <td class="text-muted">${r.ubicacion||'—'}</td>
      <td style="display:flex;gap:4px">
        <button class="btn btn-ghost btn-sm" onclick="kardexRepuesto(${r.id},'${r.nombre}')">Kardex</button>
        <button class="btn btn-green btn-sm" onclick="ajusteStock(${r.id},'${r.nombre}')">+/-</button>
        <button class="btn-icon" onclick="modalRepuesto(${r.id})"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
      </td>
    </tr>`).join('');
}

async function kardexRepuesto(id, nombre) {
  const data = await Api.get(`/repuestos/${id}/kardex`);
  openModal(`
    <div class="modal-header"><h3>Kardex — ${nombre}</h3><button class="modal-close btn-icon">✕</button></div>
    <div class="modal-body">
      <table><thead><tr><th>Tipo</th><th>Cant.</th><th>Stock ant.</th><th>Stock nuevo</th><th>Referencia</th><th>Fecha</th></tr></thead>
      <tbody>${data?.data?.length ? data.data.map(k=>`<tr>
        <td><span class="badge badge-${k.tipo==='entrada'?'aprobado':k.tipo==='salida'?'rechazado':'pendiente'}">${k.tipo}</span></td>
        <td class="fw600">${k.cantidad}</td><td class="text-muted">${k.stock_anterior}</td><td class="fw700">${k.stock_nuevo}</td>
        <td class="text-muted">${k.referencia||'—'}</td><td class="text-muted" style="font-size:.8rem">${fmtDatetime(k.created_at)}</td>
      </tr>`).join('') : `<tr><td colspan="6">${emptyState('Sin movimientos')}</td></tr>`}
      </tbody></table>
    </div>
    <div class="modal-footer"><button class="btn btn-ghost" onclick="closeModal()">Cerrar</button></div>`, 'modal-lg');
}

async function ajusteStock(id, nombre) {
  openModal(`
    <div class="modal-header"><h3>Ajuste stock — ${nombre}</h3><button class="modal-close btn-icon">✕</button></div>
    <div class="modal-body">
      <div class="form-group"><label>Tipo</label><select class="form-control" id="ajTipo"><option value="entrada">Entrada</option><option value="ajuste">Ajuste (nuevo total)</option></select></div>
      <div class="form-group"><label>Cantidad</label><input type="number" class="form-control" id="ajCant" min="0" placeholder="0"></div>
      <div class="form-group"><label>Descripción</label><input class="form-control" id="ajDesc" placeholder="Motivo…"></div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-orange" onclick="confirmarAjuste(${id})">Aplicar</button>
    </div>`, 'modal-sm');
}

async function confirmarAjuste(id) {
  const data = await Api.post(`/repuestos/${id}/ajuste`, {
    tipo: document.getElementById('ajTipo').value,
    cantidad: parseInt(document.getElementById('ajCant').value)||0,
    descripcion: document.getElementById('ajDesc').value,
  });
  if (data?.success) { toast(`Stock actualizado: ${data.nuevo_stock}`,'success'); closeModal(); loadInventario(); }
  else toast(data?.message||'Error','error');
}

async function modalRepuesto(id=null) {
  const r = id ? (await Api.get(`/repuestos?q=`))?.data?.find(x=>x.id==id)||{} : {};
  openModal(`
    <div class="modal-header"><h3>${id?'Editar':'Nuevo'} Repuesto</h3><button class="modal-close btn-icon">✕</button></div>
    <div class="modal-body">
      <div class="form-row"><div class="form-group"><label>Nombre *</label><input class="form-control" id="rNombre" value="${r.nombre||''}"></div><div class="form-group"><label>SKU</label><input class="form-control" id="rSku" value="${r.sku||''}"></div></div>
      <div class="form-row"><div class="form-group"><label>Marca</label><input class="form-control" id="rMarca" value="${r.marca||''}"></div><div class="form-group"><label>Unidad</label><input class="form-control" id="rUnidad" value="${r.unidad||'und'}"></div></div>
      <div class="form-row"><div class="form-group"><label>P.Compra</label><input type="number" class="form-control" id="rPc" value="${r.precio_compra||0}" step="0.01"></div><div class="form-group"><label>P.Venta</label><input type="number" class="form-control" id="rPv" value="${r.precio_venta||0}" step="0.01"></div></div>
      <div class="form-row"><div class="form-group"><label>Stock mínimo</label><input type="number" class="form-control" id="rMin" value="${r.stock_minimo||5}"></div><div class="form-group"><label>Ubicación</label><input class="form-control" id="rUbic" value="${r.ubicacion||''}"></div></div>
      ${!id?`<div class="form-group"><label>Stock inicial</label><input type="number" class="form-control" id="rStk" value="0"></div>`:''}
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-orange" onclick="guardarRepuesto(${id||'null'})">Guardar</button>
    </div>`);
}

async function guardarRepuesto(id) {
  const body = {
    nombre: document.getElementById('rNombre').value,
    sku: document.getElementById('rSku').value||null,
    marca: document.getElementById('rMarca').value||null,
    unidad: document.getElementById('rUnidad').value||'und',
    precio_compra: parseFloat(document.getElementById('rPc').value)||0,
    precio_venta: parseFloat(document.getElementById('rPv').value)||0,
    stock_minimo: parseInt(document.getElementById('rMin').value)||5,
    ubicacion: document.getElementById('rUbic').value||null,
    stock_actual: id ? undefined : parseInt(document.getElementById('rStk')?.value)||0,
  };
  const data = id ? await Api.put(`/repuestos/${id}`,body) : await Api.post('/repuestos',body);
  if (data?.success) { toast(`Repuesto ${id?'actualizado':'creado'}`,'success'); closeModal(); loadInventario(); }
  else toast(data?.message||'Error','error');
}


/* ══════════════════════════════════════════════════════════════
   servicios.js
══════════════════════════════════════════════════════════════ */
async function renderServicios(el) {
  el.innerHTML = `
    <div class="page-header"><h1 class="page-title">Catálogo de <span>Servicios</span></h1>
      <button class="btn btn-orange" onclick="modalServicio()">+ Nuevo servicio</button></div>
    <div class="card">
      <div class="table-wrap">
        <table>
          <thead><tr><th>Nombre</th><th>Categoría</th><th>Precio</th><th>Costo MO</th><th>Tiempo</th><th></th></tr></thead>
          <tbody id="srvTbody">${skeletonRows(6)}</tbody>
        </table>
      </div>
    </div>`;
  const data = await Api.get('/servicios');
  const tbody = document.getElementById('srvTbody');
  if (!data?.success||!data.data.length) { tbody.innerHTML=`<tr><td colspan="6">${emptyState()}</td></tr>`; return; }
  tbody.innerHTML = data.data.map(s=>`
    <tr>
      <td class="fw600">${s.nombre}</td>
      <td class="text-muted">${s.categoria_nombre||'—'}</td>
      <td class="text-accent fw700">${fmtCurrency(s.precio)}</td>
      <td class="text-muted">${fmtCurrency(s.costo_mo)}</td>
      <td class="text-muted">${s.tiempo_estimado} min</td>
      <td>
        <button class="btn-icon" onclick="modalServicio(${s.id})"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
      </td>
    </tr>`).join('');
}

async function modalServicio(id=null) {
  openModal(`
    <div class="modal-header"><h3>${id?'Editar':'Nuevo'} Servicio</h3><button class="modal-close btn-icon">✕</button></div>
    <div class="modal-body">
      <div class="form-group"><label>Nombre *</label><input class="form-control" id="snNombre" value=""></div>
      <div class="form-row">
        <div class="form-group"><label>Precio *</label><input type="number" class="form-control" id="snPrecio" step="0.01" value="0"></div>
        <div class="form-group"><label>Costo MO</label><input type="number" class="form-control" id="snMO" step="0.01" value="0"></div>
      </div>
      <div class="form-group"><label>Tiempo estimado (min)</label><input type="number" class="form-control" id="snTiempo" value="60"></div>
      <div class="form-group"><label>Descripción</label><textarea class="form-control" id="snDesc"></textarea></div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-orange" onclick="guardarServicio(${id||'null'})">Guardar</button>
    </div>`, 'modal-sm');
  if (id) {
    const data = await Api.get('/servicios');
    const s = data?.data?.find(x=>x.id===id)||{};
    document.getElementById('snNombre').value = s.nombre||'';
    document.getElementById('snPrecio').value = s.precio||0;
    document.getElementById('snMO').value = s.costo_mo||0;
    document.getElementById('snTiempo').value = s.tiempo_estimado||60;
    document.getElementById('snDesc').value = s.descripcion||'';
  }
}

async function guardarServicio(id) {
  const body = {
    nombre: document.getElementById('snNombre').value,
    precio: parseFloat(document.getElementById('snPrecio').value)||0,
    costo_mo: parseFloat(document.getElementById('snMO').value)||0,
    tiempo_estimado: parseInt(document.getElementById('snTiempo').value)||60,
    descripcion: document.getElementById('snDesc').value||null,
  };
  const data = id ? await Api.put(`/servicios/${id}`,body) : await Api.post('/servicios',body);
  if (data?.success) { toast('Guardado','success'); closeModal(); renderServicios(document.getElementById('pageContainer')); }
  else toast(data?.message||'Error','error');
}


/* ══════════════════════════════════════════════════════════════
   tecnicos.js
══════════════════════════════════════════════════════════════ */
async function renderTecnicos(el) {
  el.innerHTML = `
    <div class="page-header"><h1 class="page-title">Técnicos</h1>
      <button class="btn btn-orange" onclick="modalTecnico()">+ Nuevo técnico</button></div>
    <div class="stats-grid" id="tecStats"></div>
    <div class="card">
      <div class="table-wrap">
        <table>
          <thead><tr><th>Nombre</th><th>Especialidad</th><th>Teléfono</th><th>OTs activas</th><th>Ingresos mes</th><th>Comisión</th><th></th></tr></thead>
          <tbody id="tecTbody">${skeletonRows(7)}</tbody>
        </table>
      </div>
    </div>`;
  const data = await Api.get('/tecnicos');
  if (!data?.success) return;
  const tbody = document.getElementById('tecTbody');
  if (!data.data.length) { tbody.innerHTML=`<tr><td colspan="7">${emptyState()}</td></tr>`; return; }
  tbody.innerHTML = data.data.map(t=>`
    <tr>
      <td class="fw600">${t.nombre}</td>
      <td class="text-muted">${t.especialidad||'—'}</td>
      <td>${t.telefono||'—'}</td>
      <td class="text-center fw600">${t.ots_activas||0}</td>
      <td class="text-accent fw600">${fmtCurrency(t.ingresos_mes)}</td>
      <td>${t.comision_pct}%</td>
      <td><button class="btn-icon" onclick="modalTecnico(${t.id})"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button></td>
    </tr>`).join('');
}

async function modalTecnico(id=null) {
  const t = id ? (await Api.get('/tecnicos'))?.data?.find(x=>x.id==id)||{} : {};
  openModal(`
    <div class="modal-header"><h3>${id?'Editar':'Nuevo'} Técnico</h3><button class="modal-close btn-icon">✕</button></div>
    <div class="modal-body">
      <div class="form-group"><label>Nombre *</label><input class="form-control" id="tnNombre" value="${t.nombre||''}"></div>
      <div class="form-row">
        <div class="form-group"><label>Especialidad</label><input class="form-control" id="tnEsp" value="${t.especialidad||''}"></div>
        <div class="form-group"><label>Teléfono</label><input class="form-control" id="tnTel" value="${t.telefono||''}"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Comisión %</label><input type="number" class="form-control" id="tnCom" value="${t.comision_pct||0}" min="0" max="100" step="0.5"></div>
        <div class="form-group"><label>Salario base</label><input type="number" class="form-control" id="tnSal" value="${t.salario_base||0}" step="0.01"></div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-orange" onclick="guardarTecnico(${id||'null'})">Guardar</button>
    </div>`, 'modal-sm');
}

async function guardarTecnico(id) {
  const body = {
    nombre: document.getElementById('tnNombre').value,
    especialidad: document.getElementById('tnEsp').value||null,
    telefono: document.getElementById('tnTel').value||null,
    comision_pct: parseFloat(document.getElementById('tnCom').value)||0,
    salario_base: parseFloat(document.getElementById('tnSal').value)||0,
  };
  const data = id ? await Api.put(`/tecnicos/${id}`,body) : await Api.post('/tecnicos',body);
  if (data?.success) { toast('Guardado','success'); closeModal(); renderTecnicos(document.getElementById('pageContainer')); }
  else toast(data?.message||'Error','error');
}
