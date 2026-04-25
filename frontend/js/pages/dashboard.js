async function renderDashboard(el) {
  el.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Dashboard <span>en tiempo real</span></h1>
      <button class="btn btn-ghost btn-sm" onclick="renderDashboard(document.getElementById('pageContainer'))">↻ Actualizar</button>
    </div>
    <div class="stats-grid" id="dashStats">
      ${[...Array(5)].map(()=>`<div class="stat-card"><div class="stat-icon orange skeleton" style="width:46px;height:46px"></div><div><div class="skeleton" style="width:60px;height:24px;margin-bottom:6px"></div><div class="skeleton" style="width:80px;height:12px"></div></div></div>`).join('')}
    </div>
    <div style="display:grid;grid-template-columns:2fr 1fr;gap:20px">
      <div>
        <div class="card">
          <div class="card-header"><span class="card-title">Órdenes activas</span>
            <button class="btn btn-orange btn-sm" onclick="navigateTo('ots')">+ Nueva OT</button>
          </div>
          <div class="table-wrap" id="dashOTs"><div class="skeleton" style="height:200px;border-radius:8px"></div></div>
        </div>
        <div class="card">
          <div class="card-header"><span class="card-title">Ventas últimos 7 días</span></div>
          <div class="bar-chart" id="dashChart"></div>
        </div>
      </div>
      <div>
        <div class="card">
          <div class="card-header"><span class="card-title">🔔 Alertas</span></div>
          <div id="dashAlertas"><div class="skeleton" style="height:180px;border-radius:8px"></div></div>
        </div>
        <div class="card">
          <div class="card-header"><span class="card-title">Top servicios</span></div>
          <div id="dashTopServ"></div>
        </div>
      </div>
    </div>`;

  // Load data parallel
  const [stats, ots, ventas, alertas, top] = await Promise.all([
    Api.get('/dashboard/stats'),
    Api.get('/dashboard/ots-activas'),
    Api.get('/dashboard/ventas-semana'),
    Api.get('/dashboard/alertas'),
    Api.get('/dashboard/top-servicios'),
  ]);

  // Stats
  if (stats?.success) {
    const d = stats.data;
    document.getElementById('dashStats').innerHTML = `
      <div class="stat-card"><div class="stat-icon orange">📋</div><div><div class="stat-value">${d.ots_hoy}</div><div class="stat-label">OTs hoy</div></div></div>
      <div class="stat-card"><div class="stat-icon green">💰</div><div><div class="stat-value">${fmtCurrency(d.ingresos_hoy)}</div><div class="stat-label">Ingresos hoy</div></div></div>
      <div class="stat-card"><div class="stat-icon blue">⚙️</div><div><div class="stat-value">${d.en_proceso}</div><div class="stat-label">En proceso</div></div></div>
      <div class="stat-card"><div class="stat-icon yellow">⏳</div><div><div class="stat-value">${d.pendientes}</div><div class="stat-label">Pendientes</div></div></div>
      <div class="stat-card"><div class="stat-icon red">⚠️</div><div><div class="stat-value">${d.stock_critico}</div><div class="stat-label">Stock crítico</div></div></div>`;
  }

  // OTs table
  if (ots?.success) {
    document.getElementById('dashOTs').innerHTML = ots.data.length === 0
      ? emptyState('Sin órdenes activas')
      : `<table><thead><tr><th>Código</th><th>Cliente</th><th>Vehículo</th><th>Técnico</th><th>Estado</th><th>Total</th></tr></thead><tbody>
          ${ots.data.map(o=>`<tr>
            <td class="fw600 text-accent">${o.codigo}</td>
            <td>${o.cliente}</td>
            <td>${o.placa} · ${o.marca} ${o.modelo}</td>
            <td>${o.tecnico||'—'}</td>
            <td>${badgeEstado(o.estado)}</td>
            <td>${fmtCurrency(o.total_estimado)}</td>
          </tr>`).join('')}
        </tbody></table>`;
  }

  // Bar chart
  if (ventas?.success && ventas.data.length) {
    const max = Math.max(...ventas.data.map(v => parseFloat(v.total)));
    document.getElementById('dashChart').innerHTML = ventas.data.map(v => {
      const pct = max > 0 ? Math.round((parseFloat(v.total) / max) * 100) : 0;
      return `<div class="bar-col"><div class="bar" style="height:${pct}%" title="${fmtCurrency(v.total)}"></div><div class="bar-label">${v.dia}</div></div>`;
    }).join('');
  } else {
    document.getElementById('dashChart').innerHTML = `<div class="text-muted" style="margin:auto;font-size:.85rem">Sin datos esta semana</div>`;
  }

  // Alertas
  if (alertas?.success) {
    const d = alertas.data;
    let html = '';
    if (d.stock_bajo?.length) {
      html += `<div style="margin-bottom:12px"><div class="fw600 text-red" style="font-size:.82rem;margin-bottom:8px">⚠ Stock bajo</div>`;
      html += d.stock_bajo.map(r=>`<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);font-size:.83rem"><span>${r.nombre}</span><span class="text-red fw600">${r.stock_actual} / ${r.stock_minimo}</span></div>`).join('');
      html += '</div>';
    }
    if (d.recordatorios?.length) {
      html += `<div><div class="fw600 text-accent" style="font-size:.82rem;margin-bottom:8px">📅 Recordatorios próximos</div>`;
      html += d.recordatorios.map(r=>`<div style="padding:6px 0;border-bottom:1px solid var(--border);font-size:.83rem"><div class="fw600">${r.cliente}</div><div class="text-muted">${r.tipo} · ${fmtDate(r.fecha_programada)}</div></div>`).join('');
      html += '</div>';
    }
    document.getElementById('dashAlertas').innerHTML = html || `<div class="text-muted" style="font-size:.85rem;text-align:center;padding:16px">✓ Sin alertas</div>`;
  }

  // Top servicios
  if (top?.success) {
    document.getElementById('dashTopServ').innerHTML = top.data.length === 0
      ? emptyState('Sin datos')
      : top.data.map(s=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)">
          <span style="font-size:.85rem">${s.nombre}</span>
          <div style="text-align:right"><div class="fw600 text-accent" style="font-size:.85rem">${s.cantidad}x</div><div class="text-muted" style="font-size:.75rem">${fmtCurrency(s.total)}</div></div>
        </div>`).join('');
  }
}
