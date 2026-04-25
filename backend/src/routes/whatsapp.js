const express = require('express');
const router  = express.Router();
const db      = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

router.use(authMiddleware);

// Módulos disponibles para permisos
const MODULOS = ['dashboard','ots','clientes','vehiculos','inventario',
  'servicios','tecnicos','ventas','caja','compras','reportes','whatsapp','roles','config'];

// GET /api/whatsapp/plantillas
router.get('/plantillas', async (_req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM wa_plantillas WHERE activo=1 ORDER BY nombre');
    res.json({ success: true, data: rows });
  } catch(err) { res.status(500).json({ success: false, message: 'Error' }); }
});

router.post('/plantillas', async (req, res) => {
  try {
    const { nombre, tipo, mensaje } = req.body;
    const [r] = await db.pool.execute(
      'INSERT INTO wa_plantillas (nombre, tipo, mensaje) VALUES (?,?,?)',
      [nombre, tipo, mensaje]
    );
    const { rows } = await db.query('SELECT * FROM wa_plantillas WHERE id=?', [r.insertId]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch(err) { res.status(500).json({ success: false, message: 'Error' }); }
});

router.put('/plantillas/:id', async (req, res) => {
  try {
    const { nombre, tipo, mensaje } = req.body;
    await db.query('UPDATE wa_plantillas SET nombre=?,tipo=?,mensaje=? WHERE id=?',
      [nombre, tipo, mensaje, req.params.id]);
    const { rows } = await db.query('SELECT * FROM wa_plantillas WHERE id=?', [req.params.id]);
    res.json({ success: true, data: rows[0] });
  } catch(err) { res.status(500).json({ success: false, message: 'Error' }); }
});

router.delete('/plantillas/:id', async (req, res) => {
  try {
    await db.query('UPDATE wa_plantillas SET activo=0 WHERE id=?', [req.params.id]);
    res.json({ success: true });
  } catch(err) { res.status(500).json({ success: false, message: 'Error' }); }
});

// POST /api/whatsapp/enviar — registra el envío y devuelve link + token portal
router.post('/enviar', async (req, res) => {
  try {
    const { cliente_id, ot_id, mensaje } = req.body;
    if (!cliente_id || !mensaje)
      return res.status(400).json({ success: false, message: 'Datos incompletos' });

    const { rows: cli } = await db.query('SELECT * FROM clientes WHERE id=?', [cliente_id]);
    if (!cli.length) return res.status(404).json({ success: false, message: 'Cliente no encontrado' });

    // Generar token de seguimiento si viene ot_id
    let token = null;
    if (ot_id) {
      token = uuidv4().replace(/-/g,'').substring(0,16);
      // Guardar o actualizar token
      await db.query(
        `INSERT INTO portal_tokens (ot_id, token) VALUES (?,?)
         ON DUPLICATE KEY UPDATE token=VALUES(token), created_at=NOW()`,
        [ot_id, token]
      );
    }

    // Registrar en log
    await db.pool.execute(
      `INSERT INTO wa_log (cliente_id, ot_id, mensaje, telefono, usuario_id)
       VALUES (?,?,?,?,?)`,
      [cliente_id, ot_id||null, mensaje, cli[0].telefono||'', req.user.id]
    );

    const phone = (cli[0].telefono||'').replace(/\D/g,'');
    const num   = phone.startsWith('51') ? phone : `51${phone}`;
    const link  = `https://wa.me/${num}?text=${encodeURIComponent(mensaje)}`;

    res.json({ success: true, wa_link: link, token, telefono: cli[0].telefono });
  } catch(err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error' });
  }
});

// GET /api/whatsapp/log
router.get('/log', async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT wl.*, c.nombre AS cliente, c.telefono,
             ot.codigo AS ot_codigo, u.nombre AS usuario
      FROM wa_log wl
      JOIN clientes c ON wl.cliente_id = c.id
      LEFT JOIN ordenes_trabajo ot ON wl.ot_id = ot.id
      LEFT JOIN usuarios u ON wl.usuario_id = u.id
      ORDER BY wl.created_at DESC LIMIT 100
    `);
    res.json({ success: true, data: rows });
  } catch(err) { res.status(500).json({ success: false, message: 'Error' }); }
});

// GET /api/whatsapp/construir/:ot_id — construir mensaje con datos reales de la OT
router.get('/construir/:ot_id', async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT ot.*, c.nombre AS cliente, c.telefono,
             v.placa, v.marca, v.modelo,
             t.nombre AS tecnico
      FROM ordenes_trabajo ot
      JOIN clientes c  ON ot.cliente_id  = c.id
      JOIN vehiculos v ON ot.vehiculo_id = v.id
      LEFT JOIN tecnicos t ON ot.tecnico_id = t.id
      WHERE ot.id = ?
    `, [req.params.ot_id]);

    if (!rows.length) return res.status(404).json({ success: false, message: 'OT no encontrada' });
    const o = rows[0];

    // Obtener token si existe
    const { rows: tk } = await db.query(
      'SELECT token FROM portal_tokens WHERE ot_id=? LIMIT 1', [req.params.ot_id]
    );
    const token = tk[0]?.token || null;

    const estados = {
      pendiente:'⏳ Pendiente de revisión', diagnostico:'🔍 En diagnóstico',
      aprobado:'✅ Presupuesto aprobado', en_proceso:'🔧 En reparación',
      terminado:'✔️ Reparación terminada', facturado:'🧾 Facturado',
      entregado:'🎉 Entregado', rechazado:'❌ Presupuesto rechazado',
    };

    const BASE = process.env.CORS_ORIGIN || 'https://magus-ecommerce.com';
    const portalUrl = token ? `${BASE}/mecanica/seguimiento/${token}` : null;

    res.json({
      success: true,
      data: {
        ...o,
        token,
        portal_url: portalUrl,
        estado_label: estados[o.estado] || o.estado,
      }
    });
  } catch(err) {
    res.status(500).json({ success: false, message: 'Error' });
  }
});

module.exports = router;
