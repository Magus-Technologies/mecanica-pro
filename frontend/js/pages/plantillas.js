/* ══════════════════════════════════════════════════════════════
   plantillas.js — Configuración de plantillas de impresión
══════════════════════════════════════════════════════════════ */

let _pcfg = {};

async function renderPlantillas(el) {
  el.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Plantillas de <span>Impresión</span></h1>
      <div style="display:flex;gap:8px">
        <button class="btn btn-ghost btn-sm" onclick="navigateTo('ventas')">← Facturación</button>
        <button class="btn btn-orange btn-sm" onclick="abrirVistaPrevia()">👁 Vista previa</button>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 380px;gap:20px;align-items:start">

      <!-- Columna izquierda: formulario -->
      <div id="plantForm">
        <div class="skeleton" style="height:500px;border-radius:12px"></div>
      </div>

      <!-- Columna derecha: preview miniatura -->
      <div style="position:sticky;top:20px">
        <div class="card" style="padding:0;overflow:hidden">
          <div style="background:var(--bg3);padding:12px 16px;display:flex;gap:8px;border-bottom:1px solid var(--border)">
            <button class="btn btn-sm" id="btnA4" onclick="switchPreview('a4')"
              style="background:var(--accent);color:#fff;border:none;padding:6px 16px;border-radius:6px;cursor:pointer;font-weight:600">A4</button>
            <button class="btn btn-sm" id="btnV80" onclick="switchPreview('v80')"
              style="background:var(--bg2);color:var(--text2);border:1px solid var(--border);padding:6px 16px;border-radius:6px;cursor:pointer">Voucher 80mm</button>
          </div>
          <div style="background:#e5e7eb;padding:16px;min-height:400px;display:flex;justify-content:center">
            <div id="previewMini" style="transform:scale(0.45);transform-origin:top center;width:210mm;min-height:200px"></div>
          </div>
        </div>
        <button class="btn btn-green" style="width:100%;margin-top:12px;padding:11px" onclick="abrirVistaPrevia()">
          🖨️ Abrir vista previa real en nueva pestaña
        </button>
      </div>
    </div>`;

  const data = await Api.get('/plantillas/config');
  _pcfg = data?.data || {};
  renderFormulario();
  actualizarPreviewMini();
}

function renderFormulario() {
  document.getElementById('plantForm').innerHTML = `

    <!-- Datos empresa -->
    <div class="card" style="margin-bottom:16px">
      <div class="card-title" style="margin-bottom:16px">🏢 Datos de la empresa</div>
      <div class="form-row">
        <div class="form-group">
          <label>Razón Social / Nombre</label>
          <input class="form-control" id="pRazon" value="${_pcfg.razon_social||''}" oninput="actualizarPreviewMini()">
        </div>
        <div class="form-group">
          <label>RUC</label>
          <input class="form-control" id="pRuc" value="${_pcfg.ruc||''}" oninput="actualizarPreviewMini()">
        </div>
      </div>
      <div class="form-group">
        <label>Dirección</label>
        <input class="form-control" id="pDir" value="${_pcfg.direccion||''}" oninput="actualizarPreviewMini()">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Teléfono</label>
          <input class="form-control" id="pTel" value="${_pcfg.telefono||''}" oninput="actualizarPreviewMini()">
        </div>
        <div class="form-group">
          <label>Email</label>
          <input class="form-control" id="pEmail" value="${_pcfg.email||''}" oninput="actualizarPreviewMini()">
        </div>
      </div>

      <div class="form-group">
        <label>Logo de la empresa</label>
        <div style="display:flex;align-items:center;gap:12px;margin-top:6px">
          <div style="width:64px;height:64px;border:2px dashed var(--border);border-radius:8px;display:flex;align-items:center;justify-content:center;overflow:hidden;background:var(--bg3)">
            ${_pcfg.logo_url
              ? `<img src="/mecanica${_pcfg.logo_url}" style="max-width:100%;max-height:100%;object-fit:contain" id="logoPreviewImg">`
              : `<span style="font-size:.7rem;color:var(--text3);text-align:center" id="logoPreviewImg">Logo</span>`}
          </div>
          <div>
            <label class="btn btn-ghost btn-sm" style="cursor:pointer">
              📤 Subir logo
              <input type="file" accept="image/*" style="display:none" onchange="subirLogo(this)">
            </label>
            <div class="text-muted" style="font-size:.75rem;margin-top:4px">PNG, JPG · Máx 2MB · Recomendado: fondo blanco</div>
          </div>
        </div>
        <div style="display:flex;gap:16px;margin-top:10px">
          <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:.85rem">
            <input type="checkbox" id="pMostrarLogo" ${_pcfg.mostrar_logo?'checked':''} onchange="actualizarPreviewMini()">
            Mostrar logo en comprobante
          </label>
          <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:.85rem">
            <input type="checkbox" id="pMostrarQR" ${_pcfg.mostrar_qr!==0?'checked':''} onchange="actualizarPreviewMini()">
            Mostrar código QR
          </label>
        </div>
      </div>
    </div>

    <!-- Mensaje cabecera -->
    <div class="card" style="margin-bottom:16px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <div>
          <div class="card-title" style="margin-bottom:2px">📌 Mensaje de Cabecera</div>
          <div class="text-muted" style="font-size:.78rem">Aparece debajo del logo, antes de los datos del cliente</div>
        </div>
        <label class="toggle-wrap">
          <input type="checkbox" id="pCabeceraActivo" ${_pcfg.cabecera_activo?'checked':''} onchange="actualizarPreviewMini()">
          <span class="toggle"></span>
        </label>
      </div>
      <div class="form-group">
        <textarea class="form-control" id="pCabecera" rows="3"
          placeholder="Puedes usar texto plano o HTML básico (<b>, <br>, <span style>)"
          oninput="actualizarPreviewMini()">${_pcfg.mensaje_cabecera||''}</textarea>
      </div>
    </div>

    <!-- Cuentas bancarias -->
    <div class="card" style="margin-bottom:16px">
      <div class="card-title" style="margin-bottom:6px">🏦 Cuentas Bancarias</div>
      <div class="text-muted" style="font-size:.78rem;margin-bottom:10px">Aparece en la parte inferior izquierda. Una cuenta por línea.</div>
      <textarea class="form-control" id="pCuentas" rows="3"
        placeholder="BCP CUENTA SOLES CORRIENTE 123456789&#10;INTERBANK CCI 003-123456789"
        oninput="actualizarPreviewMini()">${_pcfg.cuentas_bancarias||''}</textarea>
    </div>

    <!-- Mensaje pie -->
    <div class="card" style="margin-bottom:16px">
      <div class="card-title" style="margin-bottom:6px">💬 Mensaje de Pie de página</div>
      <input class="form-control" id="pPie"
        value="${_pcfg.mensaje_pie||'¡GRACIAS POR SU PREFERENCIA!'}"
        oninput="actualizarPreviewMini()">
    </div>

    <!-- Series -->
    <div class="card" style="margin-bottom:16px">
      <div class="card-title" style="margin-bottom:12px">🔢 Series de comprobantes</div>
      <div class="form-row cols3">
        <div class="form-group">
          <label>Serie Boleta</label>
          <input class="form-control" id="pSerieB" value="${_pcfg.serie_boleta||'B001'}">
        </div>
        <div class="form-group">
          <label>Serie Factura</label>
          <input class="form-control" id="pSerieF" value="${_pcfg.serie_factura||'F001'}">
        </div>
        <div class="form-group">
          <label>Serie Nota Venta</label>
          <input class="form-control" id="pSerieN" value="${_pcfg.serie_nota||'NV01'}">
        </div>
      </div>
    </div>

    <button class="btn btn-orange" style="width:100%;padding:12px;font-size:.95rem" onclick="guardarPlantillaConfig()">
      💾 Guardar configuración
    </button>`;
}

let _previewMode = 'a4';

function switchPreview(mode) {
  _previewMode = mode;
  document.getElementById('btnA4').style.background  = mode==='a4'  ? 'var(--accent)' : 'var(--bg2)';
  document.getElementById('btnA4').style.color       = mode==='a4'  ? '#fff' : 'var(--text2)';
  document.getElementById('btnV80').style.background = mode==='v80' ? 'var(--accent)' : 'var(--bg2)';
  document.getElementById('btnV80').style.color      = mode==='v80' ? '#fff' : 'var(--text2)';

  const mini = document.getElementById('previewMini');
  if (mini) {
    mini.style.width = mode === 'a4' ? '210mm' : '80mm';
    mini.style.transform = mode === 'a4' ? 'scale(0.45)' : 'scale(0.7)';
  }
  actualizarPreviewMini();
}

function getCfgActual() {
  return {
    razon_social:     document.getElementById('pRazon')?.value || _pcfg.razon_social || '',
    ruc:              document.getElementById('pRuc')?.value   || _pcfg.ruc || '',
    direccion:        document.getElementById('pDir')?.value   || _pcfg.direccion || '',
    telefono:         document.getElementById('pTel')?.value   || _pcfg.telefono || '',
    email:            document.getElementById('pEmail')?.value || _pcfg.email || '',
    logo_url:         _pcfg.logo_url || null,
    mostrar_logo:     document.getElementById('pMostrarLogo')?.checked ?? true,
    mostrar_qr:       document.getElementById('pMostrarQR')?.checked ?? true,
    mensaje_cabecera: document.getElementById('pCabecera')?.value || '',
    cabecera_activo:  document.getElementById('pCabeceraActivo')?.checked ?? false,
    cuentas_bancarias:document.getElementById('pCuentas')?.value || '',
    mensaje_pie:      document.getElementById('pPie')?.value || '¡GRACIAS POR SU PREFERENCIA!',
    serie_boleta:     document.getElementById('pSerieB')?.value || 'B001',
    serie_factura:    document.getElementById('pSerieF')?.value || 'F001',
    serie_nota:       document.getElementById('pSerieN')?.value || 'NV01',
  };
}

function actualizarPreviewMini() {
  const mini = document.getElementById('previewMini');
  if (!mini) return;
  const cfg = getCfgActual();
  mini.innerHTML = _previewMode === 'a4' ? generarHTMLA4(cfg, _ejemploComp()) : generarHTMLVoucher(cfg, _ejemploComp());
}

function _ejemploComp() {
  return {
    tipo: 'boleta', serie_numero: 'B001-000111',
    cliente_nombre: 'EJEMPLO CLIENTE DE MUESTRA', tipo_documento: 'DNI',
    cliente_doc: '12345678', cliente_dir: '-', fecha_emision: new Date().toISOString(),
    metodo_pago: 'efectivo', subtotal: 18.64, igv: 3.36, total: 22.00, descuento: 0,
    detalle: [{ descripcion: 'Consulta general', cantidad: 1, precio_unitario: 22, subtotal: 22 }]
  };
}

/* ─── GENERADORES HTML ───────────────────────────────────────── */
function generarHTMLA4(cfg, comp) {
  const fecha = new Date(comp.fecha_emision).toLocaleDateString('es-PE');
  const tipo  = comp.tipo === 'boleta' ? 'BOLETA DE VENTA' : comp.tipo === 'factura' ? 'FACTURA' : 'NOTA DE VENTA';
  const cuentas = (cfg.cuentas_bancarias||'').split('\n').filter(Boolean);

  return `<div style="font-family:Arial,sans-serif;font-size:11px;color:#111;background:#fff;padding:20px 24px;width:210mm;min-height:297mm;box-sizing:border-box">

    <!-- Cabecera -->
    <table style="width:100%;margin-bottom:10px"><tr>
      <td style="width:60%">
        ${cfg.mostrar_logo && cfg.logo_url
          ? `<img src="/mecanica${cfg.logo_url}" style="max-height:50px;max-width:120px;object-fit:contain;margin-bottom:4px"><br>`
          : ''}
        <strong style="font-size:13px">${cfg.razon_social||'Mi Taller'}</strong><br>
        ${cfg.direccion||''}<br>
        Tel: ${cfg.telefono||''}<br>
        Correo: ${cfg.email||''}
      </td>
      <td style="width:40%;text-align:right;vertical-align:top">
        <div style="border:2px solid #111;padding:6px 10px;display:inline-block;text-align:center;min-width:150px">
          <div style="font-size:10px">R.U.C. ${cfg.ruc||''}</div>
          <div style="background:#f97316;color:#fff;font-weight:700;padding:3px 8px;margin:4px 0;font-size:11px">${tipo}</div>
          <div style="font-size:13px;font-weight:700;border-top:1px solid #111;padding-top:4px">${comp.serie_numero}</div>
        </div>
      </td>
    </tr></table>

    <hr style="border:1px solid #111;margin:6px 0">

    <!-- Segunda cabecera empresa -->
    <div style="font-size:10px;margin-bottom:6px">
      <strong>${cfg.razon_social||''}</strong><br>
      ${cfg.direccion||''} · TELEF.: ${cfg.telefono||''}<br>
      Correo: ${cfg.email||''}
    </div>

    ${cfg.cabecera_activo && cfg.mensaje_cabecera
      ? `<div style="font-size:10px;margin-bottom:6px">${cfg.mensaje_cabecera}</div>` : ''}

    <!-- Datos cliente + emisión -->
    <table style="width:100%;border:1px solid #ccc;font-size:10px;margin-bottom:8px"><tr>
      <td style="width:55%;padding:6px;border-right:1px solid #ccc;vertical-align:top">
        <strong>CLIENTE:</strong> ${comp.cliente_nombre}<br>
        <strong>${comp.tipo_documento||'DNI'}:</strong> ${comp.cliente_doc||''}<br>
        <strong>DIRECCIÓN:</strong> ${comp.cliente_dir||'-'}
      </td>
      <td style="width:45%;padding:6px;vertical-align:top">
        <strong>FECHA EMISIÓN:</strong> ${fecha}<br>
        <strong>MONEDA:</strong> SOLES<br>
        <strong>FORMA DE PAGO:</strong> CONTADO<br>
        <strong>MÉTODO PAGO:</strong> ${(comp.metodo_pago||'efectivo').toUpperCase()}
      </td>
    </tr></table>

    <!-- Detalle -->
    <table style="width:100%;border-collapse:collapse;font-size:10px;margin-bottom:8px">
      <thead>
        <tr style="background:#f3f4f6">
          <th style="border:1px solid #ccc;padding:4px;text-align:center;width:5%">N°</th>
          <th style="border:1px solid #ccc;padding:4px;text-align:center;width:7%">CANT.</th>
          <th style="border:1px solid #ccc;padding:4px;text-align:center;width:8%">UNIDAD</th>
          <th style="border:1px solid #ccc;padding:4px;text-align:center;width:8%">CODIGO</th>
          <th style="border:1px solid #ccc;padding:4px;text-align:left">DESCRIPCIÓN</th>
          <th style="border:1px solid #ccc;padding:4px;text-align:right;width:9%">V.UNIT.</th>
          <th style="border:1px solid #ccc;padding:4px;text-align:right;width:7%">IGV.</th>
          <th style="border:1px solid #ccc;padding:4px;text-align:right;width:9%">P.UNIT.</th>
          <th style="border:1px solid #ccc;padding:4px;text-align:right;width:9%">TOTAL</th>
        </tr>
      </thead>
      <tbody>
        ${(comp.detalle||[]).map((d,i) => {
          const vUnit = parseFloat(d.precio_unitario) / 1.18;
          const igvUnit = parseFloat(d.precio_unitario) - vUnit;
          return `<tr>
            <td style="border:1px solid #ccc;padding:3px;text-align:center">${i+1}</td>
            <td style="border:1px solid #ccc;padding:3px;text-align:center">${parseFloat(d.cantidad).toFixed(3)}</td>
            <td style="border:1px solid #ccc;padding:3px;text-align:center">NIU</td>
            <td style="border:1px solid #ccc;padding:3px;text-align:center">-</td>
            <td style="border:1px solid #ccc;padding:3px">${d.descripcion}</td>
            <td style="border:1px solid #ccc;padding:3px;text-align:right">${vUnit.toFixed(2)}</td>
            <td style="border:1px solid #ccc;padding:3px;text-align:right">${igvUnit.toFixed(2)}</td>
            <td style="border:1px solid #ccc;padding:3px;text-align:right">${parseFloat(d.precio_unitario).toFixed(2)}</td>
            <td style="border:1px solid #ccc;padding:3px;text-align:right">${parseFloat(d.subtotal).toFixed(2)}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>

    <!-- Son: -->
    <div style="background:#f3f4f6;border:1px solid #ccc;padding:5px 8px;font-size:10px;font-weight:700;margin-bottom:8px;text-align:center">
      SON: ${numeroALetras(comp.total)} SOLES
    </div>

    <!-- Cuentas + Totales -->
    <table style="width:100%;font-size:10px;margin-bottom:10px"><tr>
      <td style="vertical-align:top;width:55%">
        ${cuentas.map(c => `<div>${c}</div>`).join('')}
      </td>
      <td style="vertical-align:top;width:45%">
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:2px 4px">OP. GRAVADAS: S/</td><td style="text-align:right;padding:2px 4px">${parseFloat(comp.subtotal||0).toFixed(2)}</td></tr>
          <tr><td style="padding:2px 4px">OP. EXONERADAS:</td><td style="text-align:right;padding:2px 4px">0.00</td></tr>
          <tr><td style="padding:2px 4px">SUB TOTAL: S/</td><td style="text-align:right;padding:2px 4px">${parseFloat(comp.subtotal||0).toFixed(2)}</td></tr>
          <tr><td style="padding:2px 4px">IGV 18.0%: S/</td><td style="text-align:right;padding:2px 4px">${parseFloat(comp.igv||0).toFixed(2)}</td></tr>
          <tr style="border-top:2px solid #111">
            <td style="padding:3px 4px;font-weight:700;font-size:12px">TOTAL: S/</td>
            <td style="text-align:right;padding:3px 4px;font-weight:700;font-size:12px">${parseFloat(comp.total||0).toFixed(2)}</td>
          </tr>
        </table>
      </td>
    </tr></table>

    <!-- Pie -->
    <div style="text-align:center;margin-bottom:8px">
      ${cfg.mensaje_pie ? `<div style="font-size:10px">${cfg.mensaje_pie}</div>` : ''}
      ${cfg.mostrar_qr ? `<div style="margin-top:6px"><img src="https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${encodeURIComponent(comp.serie_numero)}" style="width:60px;height:60px"></div>` : ''}
    </div>

    <hr style="border:0;border-top:1px dashed #999;margin:6px 0">
    <div style="font-size:9px;text-align:center;color:#555">
      Representación impresa de la ${tipo}.<br>
      ${cfg.mensaje_pie||''}
    </div>
  </div>`;
}

function generarHTMLVoucher(cfg, comp) {
  const fecha = new Date(comp.fecha_emision).toLocaleDateString('es-PE');
  const tipo  = comp.tipo === 'boleta' ? 'BOLETA DE VENTA' : comp.tipo === 'factura' ? 'FACTURA' : 'NOTA DE VENTA';
  const cuentas = (cfg.cuentas_bancarias||'').split('\n').filter(Boolean);

  return `<div style="font-family:Arial,sans-serif;font-size:10px;color:#111;background:#fff;padding:8px 10px;width:72mm;box-sizing:border-box">

    <!-- Logo y empresa -->
    <div style="text-align:center;margin-bottom:6px">
      ${cfg.mostrar_logo && cfg.logo_url
        ? `<img src="/mecanica${cfg.logo_url}" style="max-height:40px;max-width:80px;object-fit:contain;display:block;margin:0 auto 3px"><br>` : ''}
      <strong style="font-size:12px">${cfg.razon_social||'Mi Taller'}</strong><br>
      <span style="font-size:9px">${cfg.direccion||''}</span><br>
      <span style="font-size:9px">Tel: ${cfg.telefono||''}</span>
    </div>

    <div style="text-align:center;border:1px solid #111;padding:4px;margin-bottom:6px">
      <div style="font-size:9px">R.U.C. ${cfg.ruc||''}</div>
      <div style="background:#f97316;color:#fff;font-weight:700;padding:2px;font-size:10px">${tipo}</div>
      <div style="font-weight:700;font-size:11px">${comp.serie_numero}</div>
    </div>

    ${cfg.cabecera_activo && cfg.mensaje_cabecera
      ? `<div style="font-size:9px;margin-bottom:4px;text-align:center">${cfg.mensaje_cabecera}</div>` : ''}

    <div style="border-top:1px dashed #999;border-bottom:1px dashed #999;padding:4px 0;margin-bottom:4px;font-size:9px">
      <strong>Cliente:</strong> ${comp.cliente_nombre}<br>
      <strong>${comp.tipo_documento||'DNI'}:</strong> ${comp.cliente_doc||''}<br>
      <strong>Fecha:</strong> ${fecha}<br>
      <strong>Pago:</strong> ${(comp.metodo_pago||'efectivo').toUpperCase()}
    </div>

    <!-- Detalle -->
    <table style="width:100%;font-size:9px;margin-bottom:4px">
      <thead><tr style="border-bottom:1px solid #999">
        <th style="text-align:left;padding:2px 0">Descripción</th>
        <th style="text-align:center;padding:2px 2px">Cant</th>
        <th style="text-align:right;padding:2px 0">Total</th>
      </tr></thead>
      <tbody>
        ${(comp.detalle||[]).map(d => `<tr>
          <td style="padding:2px 0">${d.descripcion}</td>
          <td style="text-align:center;padding:2px 2px">${d.cantidad}</td>
          <td style="text-align:right;padding:2px 0">${parseFloat(d.subtotal).toFixed(2)}</td>
        </tr>`).join('')}
      </tbody>
    </table>

    <div style="border-top:1px dashed #999;padding-top:4px;font-size:9px">
      <table style="width:100%">
        <tr><td>Subtotal:</td><td style="text-align:right">${parseFloat(comp.subtotal||0).toFixed(2)}</td></tr>
        <tr><td>IGV 18%:</td><td style="text-align:right">${parseFloat(comp.igv||0).toFixed(2)}</td></tr>
        <tr style="font-weight:700;font-size:11px"><td>TOTAL S/:</td><td style="text-align:right">${parseFloat(comp.total||0).toFixed(2)}</td></tr>
      </table>
    </div>

    ${cuentas.length ? `<div style="font-size:8px;margin-top:4px;border-top:1px dashed #999;padding-top:4px">${cuentas.map(c=>`<div>${c}</div>`).join('')}</div>` : ''}

    <div style="text-align:center;margin-top:6px;font-size:9px">
      ${cfg.mensaje_pie||'¡GRACIAS POR SU PREFERENCIA!'}
      ${cfg.mostrar_qr ? `<br><img src="https://api.qrserver.com/v1/create-qr-code/?size=50x50&data=${encodeURIComponent(comp.serie_numero)}" style="width:50px;height:50px;margin-top:4px">` : ''}
    </div>
  </div>`;
}

/* ─── Número a letras (básico) ──────────────────────────────── */
function numeroALetras(n) {
  const num = parseFloat(n||0);
  const ent = Math.floor(num);
  const dec = Math.round((num - ent) * 100);
  const unidades = ['','UNO','DOS','TRES','CUATRO','CINCO','SEIS','SIETE','OCHO','NUEVE',
    'DIEZ','ONCE','DOCE','TRECE','CATORCE','QUINCE','DIECISÉIS','DIECISIETE','DIECIOCHO','DIECINUEVE'];
  const decenas  = ['','','VEINTE','TREINTA','CUARENTA','CINCUENTA','SESENTA','SETENTA','OCHENTA','NOVENTA'];
  const centenas = ['','CIEN','DOSCIENTOS','TRESCIENTOS','CUATROCIENTOS','QUINIENTOS',
    'SEISCIENTOS','SETECIENTOS','OCHOCIENTOS','NOVECIENTOS'];
  function conv(n) {
    if (n === 0) return '';
    if (n < 20) return unidades[n];
    if (n < 100) return decenas[Math.floor(n/10)] + (n%10 ? ' Y ' + unidades[n%10] : '');
    if (n < 1000) return centenas[Math.floor(n/100)] + (n%100 ? ' ' + conv(n%100) : '');
    if (n < 1000000) return (Math.floor(n/1000)===1?'MIL':conv(Math.floor(n/1000))+' MIL') + (n%1000 ? ' ' + conv(n%1000) : '');
    return n.toString();
  }
  return `${conv(ent) || 'CERO'} CON ${String(dec).padStart(2,'0')}/100`;
}

/* ─── Guardar config ────────────────────────────────────────── */
async function guardarPlantillaConfig() {
  const cfg = getCfgActual();
  const data = await Api.put('/plantillas/config', cfg);
  if (data?.success) {
    _pcfg = { ..._pcfg, ...cfg };
    toast('Configuración guardada', 'success');
  } else {
    toast(data?.message || 'Error al guardar', 'error');
  }
}

/* ─── Subir logo ────────────────────────────────────────────── */
async function subirLogo(input) {
  const file = input.files[0];
  if (!file) return;
  const fd = new FormData();
  fd.append('logo', file);
  const data = await Api.upload('/plantillas/upload-logo', fd);
  if (data?.success) {
    _pcfg.logo_url = data.url;
    const el = document.getElementById('logoPreviewImg');
    if (el) {
      el.outerHTML = `<img src="/mecanica${data.url}" style="max-width:100%;max-height:100%;object-fit:contain" id="logoPreviewImg">`;
    }
    toast('Logo subido', 'success');
    actualizarPreviewMini();
  } else {
    toast(data?.message || 'Error al subir', 'error');
  }
}

/* ─── Vista previa real en nueva pestaña ────────────────────── */
function abrirVistaPrevia() {
  const cfg  = getCfgActual();
  const comp = _ejemploComp();
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
    <title>Vista Previa Comprobante</title>
    <style>
      body{margin:0;background:#e5e7eb;display:flex;flex-direction:column;align-items:center;padding:20px;gap:20px}
      .sheet{background:#fff;box-shadow:0 4px 20px rgba(0,0,0,.2)}
      @media print{body{background:#fff;padding:0}.no-print{display:none}.sheet{box-shadow:none}}
    </style>
  </head><body>
    <div class="no-print" style="display:flex;gap:10px;margin-bottom:10px">
      <button onclick="window.print()" style="padding:10px 24px;background:#f97316;color:#fff;border:none;border-radius:8px;font-size:14px;cursor:pointer;font-weight:700">🖨️ Imprimir</button>
      <button onclick="window.close()" style="padding:10px 18px;background:#374151;color:#fff;border:none;border-radius:8px;cursor:pointer">✕ Cerrar</button>
    </div>
    <div style="display:flex;gap:20px;flex-wrap:wrap;justify-content:center">
      <div>
        <div style="text-align:center;font-size:13px;font-weight:700;margin-bottom:8px;color:#374151">Formato A4</div>
        <div class="sheet">${generarHTMLA4(cfg, comp)}</div>
      </div>
      <div>
        <div style="text-align:center;font-size:13px;font-weight:700;margin-bottom:8px;color:#374151">Voucher 80mm</div>
        <div class="sheet">${generarHTMLVoucher(cfg, comp)}</div>
      </div>
    </div>
  </body></html>`;
  const w = window.open('', '_blank');
  w.document.write(html);
  w.document.close();
}

/* ─── Función global para imprimir desde ventas ─────────────── */
async function imprimirComprobante(id, formato = 'a4') {
  const data = await Api.get(`/plantillas/comprobante/${id}`);
  if (!data?.success) { toast('Error al cargar comprobante', 'error'); return; }

  const { comprobante, detalle, config } = data.data;
  comprobante.detalle = detalle;

  const html = formato === 'a4'
    ? generarHTMLA4(config, comprobante)
    : generarHTMLVoucher(config, comprobante);

  const w = window.open('', '_blank');
  w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">
    <title>${comprobante.serie_numero}</title>
    <style>
      body{margin:0;padding:${formato==='a4'?'0':'10px'}}
      @media print{@page{margin:0;size:${formato==='a4'?'A4':'80mm auto'}}}
    </style>
  </head><body onload="window.print()">${html}</body></html>`);
  w.document.close();
}
