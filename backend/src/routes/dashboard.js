const express = require('express');
const router  = express.Router();
const db      = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/dashboard/stats
router.get('/stats', async (req, res) => {
  try {
    const [ots]        = await db.pool.execute(`SELECT COUNT(*) AS total FROM ordenes_trabajo WHERE DATE(created_at) = CURDATE() AND activo=1`);
    const [ingresos]   = await db.pool.execute(`SELECT COALESCE(SUM(total),0) AS total FROM comprobantes WHERE DATE(fecha_emision) = CURDATE() AND anulado=0`);
    const [stock]      = await db.pool.execute(`SELECT COUNT(*) AS total FROM repuestos WHERE stock_actual <= stock_minimo AND activo=1`);
    const [pendientes] = await db.pool.execute(`SELECT COUNT(*) AS total FROM ordenes_trabajo WHERE estado IN ('pendiente','diagnostico','aprobado') AND activo=1`);
    const [en_proceso] = await db.pool.execute(`SELECT COUNT(*) AS total FROM ordenes_trabajo WHERE estado='en_proceso' AND activo=1`);

    res.json({
      success: true,
      data: {
        ots_hoy:      ots[0].total,
        ingresos_hoy: parseFloat(ingresos[0].total),
        stock_critico: stock[0].total,
        pendientes:   pendientes[0].total,
        en_proceso:   en_proceso[0].total,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error stats' });
  }
});

// GET /api/dashboard/ots-activas
router.get('/ots-activas', async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT ot.codigo, ot.estado, ot.prioridad,
             c.nombre  AS cliente,
             v.placa, v.marca, v.modelo,
             t.nombre  AS tecnico,
             ot.created_at, ot.total_estimado
      FROM ordenes_trabajo ot
      JOIN clientes  c ON ot.cliente_id  = c.id
      JOIN vehiculos v ON ot.vehiculo_id = v.id
      LEFT JOIN tecnicos t ON ot.tecnico_id = t.id
      WHERE ot.estado NOT IN ('entregado','cancelado') AND ot.activo = 1
      ORDER BY FIELD(ot.prioridad,'urgente','alta','normal','baja'), ot.created_at ASC
      LIMIT 20
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error' });
  }
});

// GET /api/dashboard/ventas-semana
router.get('/ventas-semana', async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT DATE_FORMAT(fecha_emision,'%a') AS dia,
             COALESCE(SUM(total),0)          AS total,
             DATE(fecha_emision)             AS fecha
      FROM comprobantes
      WHERE fecha_emision >= CURDATE() - INTERVAL 6 DAY AND anulado=0
      GROUP BY DATE(fecha_emision), DATE_FORMAT(fecha_emision,'%a')
      ORDER BY fecha
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error' });
  }
});

// GET /api/dashboard/alertas
router.get('/alertas', async (req, res) => {
  try {
    const [stockBajo]     = await db.pool.execute(`SELECT nombre, stock_actual, stock_minimo FROM repuestos WHERE stock_actual <= stock_minimo AND activo=1 LIMIT 8`);
    const [otsDemoradas]  = await db.pool.execute(`SELECT codigo, estado, created_at FROM ordenes_trabajo WHERE estado='en_proceso' AND created_at < NOW() - INTERVAL 3 DAY AND activo=1 LIMIT 5`);
    const [recordatorios] = await db.pool.execute(`
      SELECT r.*, c.nombre AS cliente FROM recordatorios r
      JOIN clientes c ON r.cliente_id = c.id
      WHERE r.enviado=0 AND r.fecha_programada <= DATE_ADD(CURDATE(), INTERVAL 3 DAY)
      LIMIT 5
    `);
    res.json({ success: true, data: { stock_bajo: stockBajo, ots_demoradas: otsDemoradas, recordatorios } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error' });
  }
});

// GET /api/dashboard/top-servicios
router.get('/top-servicios', async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT s.nombre, COUNT(*) AS cantidad, SUM(ots.precio_cobrado) AS total
      FROM ot_servicios ots
      JOIN servicios s ON ots.servicio_id = s.id
      JOIN ordenes_trabajo ot ON ots.ot_id = ot.id
      WHERE ot.created_at >= CURDATE() - INTERVAL 30 DAY
      GROUP BY s.id, s.nombre ORDER BY cantidad DESC LIMIT 5
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error' });
  }
});

module.exports = router;
