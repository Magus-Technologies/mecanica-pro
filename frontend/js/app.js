/* ── app.js ── Router principal ─────────────────────────────────────────── */

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
  config:     renderConfig,
};

let currentPage = 'dashboard';

async function init() {
  const token = localStorage.getItem('mp_token');
  const user  = JSON.parse(localStorage.getItem('mp_user') || 'null');

  if (!token || !user) {
    showLogin();
    return;
  }
  showApp(user);
  navigateTo('dashboard');
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
}

function navigateTo(page) {
  if (!PAGES[page]) return;
  currentPage = page;

  // Update nav
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });

  // Close sidebar mobile
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.add('hidden');

  // Render
  const container = document.getElementById('pageContainer');
  container.innerHTML = '';
  PAGES[page](container);
}

/* ── Login ──────────────────────────────────────────────────────────────── */
document.getElementById('loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  const btn = document.getElementById('loginBtn');
  const err = document.getElementById('loginError');
  btn.textContent = 'Ingresando…';
  btn.disabled = true;
  err.classList.add('hidden');

  const data = await Api.post('/auth/login', {
    username: document.getElementById('loginUser').value.trim(),
    password: document.getElementById('loginPass').value,
  });

  if (data?.success) {
    localStorage.setItem('mp_token', data.token);
    localStorage.setItem('mp_user', JSON.stringify(data.user));
    showApp(data.user);
    navigateTo('dashboard');
  } else {
    err.textContent = data?.message || 'Error al iniciar sesión';
    err.classList.remove('hidden');
  }
  btn.textContent = 'Ingresar';
  btn.disabled = false;
});

/* ── Logout ─────────────────────────────────────────────────────────────── */
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('mp_token');
  localStorage.removeItem('mp_user');
  showLogin();
});

/* ── Nav clicks ─────────────────────────────────────────────────────────── */
document.querySelectorAll('.nav-item').forEach(el => {
  el.addEventListener('click', e => {
    e.preventDefault();
    navigateTo(el.dataset.page);
  });
});

/* ── Hamburger ──────────────────────────────────────────────────────────── */
document.getElementById('hamburgerBtn').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebarOverlay').classList.toggle('hidden');
});
document.getElementById('sidebarOverlay').addEventListener('click', () => {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.add('hidden');
});

init();
