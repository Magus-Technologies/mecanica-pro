const express = require('express');
const router  = express.Router();
const db      = require('../config/database');

// GET /api/portal/:token — público, sin auth, para que el cliente vea su OT
router.get('/:token', async (req, res) => {
  try {
    const { rows: tk } = await db.query(
      'SELECT * FROM portal_tokens WHERE token = ? LIMIT 1', [req.params.token]
    );
    if (!tk.length)
      return res.status(404).json({ success: false, message: 'Enlace inválido o expirado' });

    const ot_id = tk[0].ot_id;

    const { rows } = await db.query(`
      SELECT ot.codigo, ot.estado, ot.prioridad, ot.diagnostico,
             ot.total_estimado, ot.total_real, ot.km_entrada, ot.km_salida,
             ot.fecha_prometida, ot.created_at, ot.updated_at,
             c.nombre AS cliente,
             v.placa, v.marca, v.modelo, v.anio, v.color, v.tipo AS vehiculo_tipo,
             t.nombre AS tecnico, t.especialidad AS tecnico_especialidad
      FROM ordenes_trabajo ot
      JOIN clientes  c ON ot.cliente_id  = c.id
      JOIN vehiculos v ON ot.vehiculo_id = v.id
      LEFT JOIN tecnicos t ON ot.tecnico_id = t.id
      WHERE ot.id = ?
    `, [ot_id]);

    if (!rows.length)
      return res.status(404).json({ success: false, message: 'Orden no encontrada' });

    const ot = rows[0];

    // Servicios
    const { rows: servicios } = await db.query(`
      SELECT s.nombre, os.precio_cobrado
      FROM ot_servicios os JOIN servicios s ON os.servicio_id = s.id
      WHERE os.ot_id = ?
    `, [ot_id]);

    // Repuestos
    const { rows: repuestos } = await db.query(`
      SELECT r.nombre, or2.cantidad, or2.precio_unitario
      FROM ot_repuestos or2 JOIN repuestos r ON or2.repuesto_id = r.id
      WHERE or2.ot_id = ?
    `, [ot_id]);

    // Historial (sin info interna)
    const { rows: historial } = await db.query(`
      SELECT estado_nuevo, descripcion, created_at
      FROM ot_historial
      WHERE ot_id = ?
      ORDER BY created_at ASC
    `, [ot_id]);

    // Evidencias
    const { rows: evidencias } = await db.query(`
      SELECT tipo, url, descripcion, created_at
      FROM ot_evidencias WHERE ot_id = ?
      ORDER BY created_at ASC
    `, [ot_id]);

    res.json({
      success: true,
      data: { ...ot, servicios, repuestos, historial, evidencias }
    });
  } catch(err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al obtener seguimiento' });
  }
});

module.exports = router;
