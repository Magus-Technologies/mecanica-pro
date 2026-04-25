/* ── app.js ── Router con permisos dinámicos ────────────────────────────── */

const PAGES = {
  dashboard:  renderDashboard,
  ots:        renderOTs,
  clientes:   renderClientes,
  vehiculos:  renderVehiculos,
  inventario: renderInventario,
  servicios:  renderServicios,
  tecnicos:   renderTecnicos,
  ventas:     renderVentas,
  caja:       renderCaja,
  compras:    renderCompras,
  reportes:   renderReportes,
  whatsapp:   renderWhatsapp,
  roles:      renderRoles,
  config:     renderConfig,
};

let currentPage  = 'dashboard';
let misPermisos  = {};

async function init() {
  const token = localStorage.getItem('mp_token');
  const user  = JSON.parse(localStorage.getItem('mp_user') || 'null');
  if (!token || !user) { showLogin(); return; }
  await cargarPermisos();
  showApp(user);
  navigateTo('dashboard');
}

async function cargarPermisos() {
  const data = await Api.get('/roles/mis-permisos');
  misPermisos = data?.data || {};
  localStorage.setItem('mp_permisos', JSON.stringify(misPermisos));
}

function puedeVer(modulo) {
  // admin siempre puede ver todo
  const user = JSON.parse(localStorage.getItem('mp_user') || '{}');
  if (user.role === 'admin') return true;
  return !!misPermisos[modulo]?.ver;
}

function showLogin() {
  document.getElementById('loginScreen').classList.remove('hidden');
  document.getElementById('app').classList.add('hidden');
}

function showApp(user) {
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  document.getElementById('userName').textContent   = user.nombre;
  document.getElementById('userRole').textContent   = user.role;
  document.getElementById('userAvatar').textContent = user.nombre.charAt(0).toUpperCase();

  // Aplicar permisos al sidebar
  document.querySelectorAll('.nav-item[data-page]').forEach(el => {
    const modulo = el.dataset.page;
    el.style.display = puedeVer(modulo) ? '' : 'none';
  });
}

function navigateTo(page) {
  if (!PAGES[page]) return;
  if (!puedeVer(page)) { toast('Sin permisos para este módulo', 'warning'); return; }
  currentPage = page;

  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.add('hidden');

  const container = document.getElementById('pageContainer');
  container.innerHTML = '';
  PAGES[page](container);
}

/* ── Login ──────────────────────────────────────────────────────────────── */
document.getElementById('loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  const btn = document.getElementById('loginBtn');
  const err = document.getElementById('loginError');
  btn.textContent = 'Ingresando…'; btn.disabled = true;
  err.classList.add('hidden');

  const data = await Api.post('/auth/login', {
    username: document.getElementById('loginUser').value.trim(),
    password: document.getElementById('loginPass').value,
  });

  if (data?.success) {
    localStorage.setItem('mp_token', data.token);
    localStorage.setItem('mp_user',  JSON.stringify(data.user));
    await cargarPermisos();
    showApp(data.user);
    navigateTo('dashboard');
  } else {
    err.textContent = data?.message || 'Error al iniciar sesión';
    err.classList.remove('hidden');
  }
  btn.textContent = 'Ingresar'; btn.disabled = false;
});

/* ── Logout ─────────────────────────────────────────────────────────────── */
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('mp_token');
  localStorage.removeItem('mp_user');
  localStorage.removeItem('mp_permisos');
  misPermisos = {};
  showLogin();
});

/* ── Nav ────────────────────────────────────────────────────────────────── */
document.querySelectorAll('.nav-item').forEach(el => {
  el.addEventListener('click', e => { e.preventDefault(); navigateTo(el.dataset.page); });
});

document.getElementById('hamburgerBtn').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebarOverlay').classList.toggle('hidden');
});
document.getElementById('sidebarOverlay').addEventListener('click', () => {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.add('hidden');
});

init();
