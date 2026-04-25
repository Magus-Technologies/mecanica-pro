const express = require('express');
const router  = express.Router();
const db      = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

/* ── Listar OTs ─────────────────────────────────────────────────────────── */
router.get('/', async (req, res) => {
  try {
    const { estado, q='', page=1, limit=20 } = req.query;
    const offset = (parseInt(page)-1)*parseInt(limit);
    const search = `%${q}%`;
    const params = [search, search, search];
    let where = `ot.activo=1 AND (ot.codigo LIKE ? OR c.nombre LIKE ? OR v.placa LIKE ?)`;
    if (estado) { where += ' AND ot.estado=?'; params.push(estado); }
    params.push(parseInt(limit), offset);

    const { rows } = await db.query(`
      SELECT ot.id, ot.codigo, ot.estado, ot.prioridad, ot.created_at,
             ot.total_estimado, ot.total_real,
             c.nombre AS cliente, c.telefono AS cliente_tel,
             v.placa, v.marca, v.modelo, v.tipo AS vehiculo_tipo,
             t.nombre AS tecnico
      FROM ordenes_trabajo ot
      JOIN clientes  c ON ot.cliente_id  = c.id
      JOIN vehiculos v ON ot.vehiculo_id = v.id
      LEFT JOIN tecnicos t ON ot.tecnico_id = t.id
      WHERE ${where}
      ORDER BY FIELD(ot.prioridad,'urgente','alta','normal','baja'), ot.created_at DESC
      LIMIT ? OFFSET ?
    `, params);

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al listar OTs' });
  }
});

/* ── Detalle OT ─────────────────────────────────────────────────────────── */
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT ot.*,
             c.nombre AS cliente, c.telefono AS cliente_tel, c.email AS cliente_email,
             v.placa, v.marca, v.modelo, v.anio, v.tipo AS vehiculo_tipo, v.color, v.vin,
             t.nombre AS tecnico
      FROM ordenes_trabajo ot
      JOIN clientes  c ON ot.cliente_id  = c.id
      JOIN vehiculos v ON ot.vehiculo_id = v.id
      LEFT JOIN tecnicos t ON ot.tecnico_id = t.id
      WHERE ot.id=?
    `, [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'OT no encontrada' });

    const [servicios, repuestos, evidencias, historial] = await Promise.all([
      db.query(`SELECT os.*, s.nombre AS servicio_nombre FROM ot_servicios os JOIN servicios s ON os.servicio_id=s.id WHERE os.ot_id=?`, [req.params.id]),
      db.query(`SELECT or2.*, r.nombre AS repuesto_nombre, r.unidad FROM ot_repuestos or2 JOIN repuestos r ON or2.repuesto_id=r.id WHERE or2.ot_id=?`, [req.params.id]),
      db.query(`SELECT * FROM ot_evidencias WHERE ot_id=? ORDER BY created_at`, [req.params.id]),
      db.query(`SELECT oh.*, u.nombre AS usuario FROM ot_historial oh LEFT JOIN usuarios u ON oh.usuario_id=u.id WHERE oh.ot_id=? ORDER BY oh.created_at`, [req.params.id]),
    ]);

    res.json({
      success: true,
      data: { ...rows[0], servicios: servicios.rows, repuestos: repuestos.rows, evidencias: evidencias.rows, historial: historial.rows },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error' });
  }
});

/* ── Crear OT ───────────────────────────────────────────────────────────── */
router.post('/', async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const { cliente_id, vehiculo_id, tecnico_id, km_entrada, prioridad='normal', diagnostico, observaciones, servicios=[], repuestos_items=[] } = req.body;
    if (!cliente_id || !vehiculo_id) return res.status(400).json({ success: false, message: 'Cliente y vehículo requeridos' });

    // Generar código OT
    const [cfg] = await conn.execute('SELECT correlativo_ot FROM taller_config WHERE id=1');
    const correlativo = (cfg[0]?.correlativo_ot || 0) + 1;
    const codigo = `OT-${String(correlativo).padStart(6,'0')}`;
    await conn.execute('UPDATE taller_config SET correlativo_ot=? WHERE id=1', [correlativo]);

    // Calcular totales estimados
    let total_servicios = 0, total_repuestos = 0;
    for (const s of servicios) total_servicios += parseFloat(s.precio_cobrado||0);
    for (const r of repuestos_items) total_repuestos += parseFloat(r.precio_unitario||0) * parseInt(r.cantidad||1);
    const total_estimado = total_servicios + total_repuestos;

    const [otResult] = await conn.execute(
      `INSERT INTO ordenes_trabajo (codigo,cliente_id,vehiculo_id,tecnico_id,km_entrada,prioridad,diagnostico,observaciones,total_estimado,estado,usuario_creacion)
       VALUES (?,?,?,?,?,?,?,?,?,'pendiente',?)`,
      [codigo, cliente_id, vehiculo_id, tecnico_id||null, km_entrada||0, prioridad, diagnostico||null, observaciones||null, total_estimado, req.user.id]
    );
    const ot_id = otResult.insertId;

    // Insertar servicios
    for (const s of servicios) {
      await conn.execute(
        `INSERT INTO ot_servicios (ot_id,servicio_id,precio_cobrado,tecnico_id) VALUES (?,?,?,?)`,
        [ot_id, s.servicio_id, s.precio_cobrado, s.tecnico_id||tecnico_id||null]
      );
    }

    // Insertar repuestos (sin descontar stock aún)
    for (const r of repuestos_items) {
      await conn.execute(
        `INSERT INTO ot_repuestos (ot_id,repuesto_id,cantidad,precio_unitario) VALUES (?,?,?,?)`,
        [ot_id, r.repuesto_id, r.cantidad, r.precio_unitario]
      );
    }

    // Historial
    await conn.execute(
      `INSERT INTO ot_historial (ot_id,estado_anterior,estado_nuevo,descripcion,usuario_id) VALUES (?,NULL,'pendiente','OT creada',?)`,
      [ot_id, req.user.id]
    );

    await conn.commit();
    const { rows } = await db.query('SELECT * FROM ordenes_trabajo WHERE id=?', [ot_id]);
    res.status(201).json({ success: true, data: rows[0], codigo });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al crear OT' });
  } finally {
    conn.release();
  }
});

/* ── Cambiar estado OT ──────────────────────────────────────────────────── */
router.patch('/:id/estado', async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const { estado, descripcion } = req.body;
    const estados_validos = ['pendiente','diagnostico','aprobado','rechazado','en_proceso','terminado','facturado','entregado','cancelado'];
    if (!estados_validos.includes(estado)) return res.status(400).json({ success: false, message: 'Estado inválido' });

    const [current] = await conn.execute('SELECT estado FROM ordenes_trabajo WHERE id=?', [req.params.id]);
    if (!current.length) return res.status(404).json({ success: false, message: 'OT no encontrada' });

    const estado_anterior = current[0].estado;

    // Si pasa a en_proceso → descontar repuestos del stock
    if (estado === 'en_proceso' && estado_anterior === 'aprobado') {
      const [repuestos] = await conn.execute('SELECT * FROM ot_repuestos WHERE ot_id=?', [req.params.id]);
      for (const r of repuestos) {
        const [stock] = await conn.execute('SELECT stock_actual FROM repuestos WHERE id=?', [r.repuesto_id]);
        if (!stock.length) continue;
        const nuevo_stock = Math.max(0, stock[0].stock_actual - r.cantidad);
        await conn.execute('UPDATE repuestos SET stock_actual=? WHERE id=?', [nuevo_stock, r.repuesto_id]);
        // Kardex
        await conn.execute(
          `INSERT INTO kardex (repuesto_id,tipo,cantidad,stock_anterior,stock_nuevo,referencia,descripcion,usuario_id)
           VALUES (?,  'salida',?,?,?,?,?,?)`,
          [r.repuesto_id, r.cantidad, stock[0].stock_actual, nuevo_stock,
           `OT-${req.params.id}`, `Consumo OT`, req.user.id]
        );
      }
    }

    await conn.execute(
      `UPDATE ordenes_trabajo SET estado=?, updated_at=NOW() WHERE id=?`,
      [estado, req.params.id]
    );

    await conn.execute(
      `INSERT INTO ot_historial (ot_id,estado_anterior,estado_nuevo,descripcion,usuario_id) VALUES (?,?,?,?,?)`,
      [req.params.id, estado_anterior, estado, descripcion||`Cambio a ${estado}`, req.user.id]
    );

    await conn.commit();
    res.json({ success: true, message: `OT actualizada a ${estado}` });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al cambiar estado' });
  } finally {
    conn.release();
  }
});

/* ── Actualizar totales reales ──────────────────────────────────────────── */
router.patch('/:id/totales', async (req, res) => {
  try {
    const { total_real, km_salida } = req.body;
    await db.query(
      `UPDATE ordenes_trabajo SET total_real=?, km_salida=?, updated_at=NOW() WHERE id=?`,
      [total_real, km_salida||null, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error' });
  }
});

module.exports = router;
