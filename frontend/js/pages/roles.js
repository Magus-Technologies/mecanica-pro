/* ══════════════════════════════════════════════════════════════
   roles.js — Gestión de roles y permisos por módulo
══════════════════════════════════════════════════════════════ */

const MODULOS_INFO = [
  { key:'dashboard',  label:'Dashboard',         icon:'📊' },
  { key:'ots',        label:'Órdenes de Trabajo', icon:'📋' },
  { key:'clientes',   label:'Clientes CRM',       icon:'👥' },
  { key:'vehiculos',  label:'Vehículos',           icon:'🚗' },
  { key:'inventario', label:'Inventario',          icon:'📦' },
  { key:'servicios',  label:'Servicios',           icon:'🔧' },
  { key:'tecnicos',   label:'Técnicos',            icon:'👨‍🔧' },
  { key:'ventas',     label:'Ventas',              icon:'🧾' },
  { key:'caja',       label:'Caja',                icon:'💵' },
  { key:'compras',    label:'Compras',             icon:'🛒' },
  { key:'reportes',   label:'Reportes',            icon:'📈' },
  { key:'whatsapp',   label:'WhatsApp',            icon:'💬' },
  { key:'roles',      label:'Roles y Permisos',    icon:'🛡️' },
  { key:'config',     label:'Configuración',       icon:'⚙️' },
];

async function renderRoles(el) {
  el.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Roles y <span>Permisos</span></h1>
    </div>
    <div id="rolesContainer"><div class="skeleton" style="height:400px;border-radius:12px"></div></div>`;
  loadRoles();
}

async function loadRoles() {
  const data = await Api.get('/roles');
  if (!data?.success) return;

  const roles = data.data.filter(r => r.nombre !== 'admin'); // admin siempre tiene todo

  let html = `
    <div style="display:grid;gap:20px">
      <div class="card" style="padding:16px 20px;background:rgba(249,115,22,.08);border-color:rgba(249,115,22,.3)">
        <div style="display:flex;align-items:center;gap:10px;font-size:.88rem">
          <span style="font-size:1.2rem">🛡️</span>
          <span>El rol <strong>admin</strong> siempre tiene acceso total y no puede editarse. Los cambios se aplican al instante cuando el usuario vuelve a iniciar sesión.</span>
        </div>
      </div>`;

  for (const rol of roles) {
    const pData = await Api.get(`/roles/${rol.id}/permisos`);
    const permisos = pData?.data || {};

    html += `
      <div class="card">
        <div class="card-header" style="margin-bottom:0">
          <div>
            <div class="fw700" style="font-size:1rem;text-transform:capitalize">${rol.nombre}</div>
            <div class="text-muted" style="font-size:.8rem">${rol.descripcion||''}</div>
          </div>
          <button class="btn btn-orange btn-sm" onclick="guardarPermisos(${rol.id}, '${rol.nombre}')">
            💾 Guardar cambios
          </button>
        </div>
        <div style="overflow-x:auto;margin-top:16px">
          <table style="min-width:560px">
            <thead>
              <tr>
                <th style="width:40%">Módulo</th>
                <th class="text-center" style="width:15%">👁 Ver</th>
                <th class="text-center" style="width:15%">➕ Crear</th>
                <th class="text-center" style="width:15%">✏️ Editar</th>
                <th class="text-center" style="width:15%">🗑 Eliminar</th>
              </tr>
            </thead>
            <tbody>
              ${MODULOS_INFO.map(m => {
                const p = permisos[m.key] || {};
                return `<tr>
                  <td>
                    <div style="display:flex;align-items:center;gap:8px">
                      <span>${m.icon}</span>
                      <span class="fw600" style="font-size:.88rem">${m.label}</span>
                    </div>
                  </td>
                  ${['ver','crear','editar','eliminar'].map(accion => `
                  <td class="text-center">
                    <label class="toggle-wrap">
                      <input type="checkbox" class="perm-check"
                        data-rol="${rol.id}" data-modulo="${m.key}" data-accion="${accion}"
                        ${p[accion] ? 'checked' : ''}
                        onchange="syncPermisoVer(this)">
                      <span class="toggle"></span>
                    </label>
                  </td>`).join('')}
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>`;
  }
  html += '</div>';
  document.getElementById('rolesContainer').innerHTML = html;
}

// Si desmarca "ver", desmarca todos los demás del mismo módulo/rol
function syncPermisoVer(cb) {
  if (cb.dataset.accion === 'ver' && !cb.checked) {
    const { rol, modulo } = cb.dataset;
    document.querySelectorAll(`.perm-check[data-rol="${rol}"][data-modulo="${modulo}"]`)
      .forEach(c => { c.checked = false; });
  }
  // Si marca crear/editar/eliminar, auto-marcar ver
  if (cb.dataset.accion !== 'ver' && cb.checked) {
    const { rol, modulo } = cb.dataset;
    const verCb = document.querySelector(`.perm-check[data-rol="${rol}"][data-modulo="${modulo}"][data-accion="ver"]`);
    if (verCb) verCb.checked = true;
  }
}

async function guardarPermisos(rolId, rolNombre) {
  const permisos = {};
  MODULOS_INFO.forEach(m => {
    permisos[m.key] = { ver:false, crear:false, editar:false, eliminar:false };
    ['ver','crear','editar','eliminar'].forEach(accion => {
      const cb = document.querySelector(`.perm-check[data-rol="${rolId}"][data-modulo="${m.key}"][data-accion="${accion}"]`);
      if (cb) permisos[m.key][accion] = cb.checked;
    });
  });

  const data = await Api.put(`/roles/${rolId}/permisos`, { permisos });
  if (data?.success) {
    toast(`Permisos de "${rolNombre}" guardados`, 'success');
  } else {
    toast(data?.message || 'Error al guardar', 'error');
  }
}
