const express = require('express');
const router  = express.Router();
const db      = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
router.use(authMiddleware);

// GET /api/reportes/ventas?desde=&hasta=
router.get('/ventas', async (req, res) => {
  try {
    const { desde, hasta } = req.query;
    const d = desde || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    const h = hasta  || new Date().toISOString().split('T')[0];

    const { rows } = await db.query(`
      SELECT DATE(fecha_emision) AS fecha,
             COUNT(*)            AS comprobantes,
             SUM(total)          AS total_ventas,
             SUM(igv)            AS total_igv
      FROM comprobantes
      WHERE DATE(fecha_emision) BETWEEN ? AND ? AND anulado=0
      GROUP BY DATE(fecha_emision) ORDER BY fecha
    `, [d, h]);

    const [resumen] = await db.pool.execute(
      `SELECT COUNT(*) AS total_comp, COALESCE(SUM(total),0) AS total_ventas FROM comprobantes WHERE DATE(fecha_emision) BETWEEN ? AND ? AND anulado=0`,
      [d, h]
    );

    res.json({ success:true, data:rows, resumen:resumen[0] });
  } catch(err){ res.status(500).json({ success:false, message:'Error' }); }
});

// GET /api/reportes/ganancias
router.get('/ganancias', async (req, res) => {
  try {
    const { mes, anio } = req.query;
    const m = mes  || new Date().getMonth()+1;
    const a = anio || new Date().getFullYear();

    const { rows } = await db.query(`
      SELECT ot.codigo,
             c.nombre AS cliente,
             v.placa,
             ot.total_real AS ingreso,
             COALESCE((SELECT SUM(or2.precio_unitario*or2.cantidad) FROM ot_repuestos or2 WHERE or2.ot_id=ot.id),0) AS costo_repuestos,
             COALESCE((SELECT SUM(os.precio_cobrado * (s.costo_mo/s.precio)) FROM ot_servicios os JOIN servicios s ON os.servicio_id=s.id WHERE os.ot_id=ot.id),0) AS costo_mo,
             ot.created_at
      FROM ordenes_trabajo ot
      JOIN clientes  c ON ot.cliente_id  = c.id
      JOIN vehiculos v ON ot.vehiculo_id = v.id
      WHERE ot.estado IN ('facturado','entregado')
        AND MONTH(ot.created_at)=? AND YEAR(ot.created_at)=?
      ORDER BY ot.created_at DESC
    `, [m, a]);

    res.json({ success:true, data:rows });
  } catch(err){ res.status(500).json({ success:false, message:'Error' }); }
});

// GET /api/reportes/tecnicos
router.get('/tecnicos', async (req, res) => {
  try {
    const { mes, anio } = req.query;
    const m = mes  || new Date().getMonth()+1;
    const a = anio || new Date().getFullYear();
    const { rows } = await db.query(`
      SELECT t.nombre AS tecnico,
             COUNT(DISTINCT ot.id) AS total_ots,
             COALESCE(SUM(ot.total_real),0) AS ingresos,
             COALESCE(SUM(ot.total_real)*t.comision_pct/100, 0) AS comision
      FROM tecnicos t
      LEFT JOIN ordenes_trabajo ot ON ot.tecnico_id=t.id
        AND ot.estado IN ('facturado','entregado')
        AND MONTH(ot.created_at)=? AND YEAR(ot.created_at)=?
      WHERE t.activo=1
      GROUP BY t.id, t.nombre, t.comision_pct ORDER BY ingresos DESC
    `, [m, a]);
    res.json({ success:true, data:rows });
  } catch(err){ res.status(500).json({ success:false, message:'Error' }); }
});

// GET /api/reportes/inventario-valorizado
router.get('/inventario-valorizado', async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT r.nombre, r.sku, r.stock_actual, r.precio_compra, r.precio_venta,
             r.stock_actual * r.precio_compra AS valor_costo,
             r.stock_actual * r.precio_venta  AS valor_venta
      FROM repuestos r WHERE r.activo=1 ORDER BY valor_costo DESC
    `);
    const [totales] = await db.pool.execute(`
      SELECT SUM(stock_actual*precio_compra) AS total_costo, SUM(stock_actual*precio_venta) AS total_venta
      FROM repuestos WHERE activo=1
    `);
    res.json({ success:true, data:rows, totales:totales[0] });
  } catch(err){ res.status(500).json({ success:false, message:'Error' }); }
});

module.exports = router;
