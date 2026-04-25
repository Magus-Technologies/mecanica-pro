const express = require('express');
const router  = express.Router();
const db      = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const { q='', cliente_id, page=1, limit=20 } = req.query;
    const offset = (parseInt(page)-1)*parseInt(limit);
    const search = `%${q}%`;
    let sql = `SELECT v.*, c.nombre AS cliente_nombre
               FROM vehiculos v JOIN clientes c ON v.cliente_id=c.id
               WHERE v.activo=1 AND (v.placa LIKE ? OR v.marca LIKE ? OR v.modelo LIKE ?)`;
    const params = [search,search,search];
    if (cliente_id) { sql += ' AND v.cliente_id=?'; params.push(cliente_id); }
    sql += ' ORDER BY v.placa LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    const { rows } = await db.query(sql, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT v.*, c.nombre AS cliente_nombre, c.telefono AS cliente_telefono
       FROM vehiculos v JOIN clientes c ON v.cliente_id=c.id WHERE v.id=?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'No encontrado' });

    const { rows: historial } = await db.query(
      `SELECT ot.codigo, ot.estado, ot.diagnostico, ot.total_real, ot.km_entrada, ot.created_at
       FROM ordenes_trabajo ot WHERE ot.vehiculo_id=? ORDER BY ot.created_at DESC LIMIT 30`, [req.params.id]);

    res.json({ success: true, data: { ...rows[0], historial } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { cliente_id, placa, marca, modelo, anio, tipo='auto', color, vin, motor, combustible='gasolina', km_actual=0, observaciones } = req.body;
    if (!cliente_id || !placa) return res.status(400).json({ success: false, message: 'Cliente y placa requeridos' });

    const [result] = await db.pool.execute(
      `INSERT INTO vehiculos (cliente_id,placa,marca,modelo,anio,tipo,color,vin,motor,combustible,km_actual,observaciones)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [cliente_id,placa.toUpperCase(),marca,modelo,anio||null,tipo,color||null,vin||null,motor||null,combustible,km_actual,observaciones||null]
    );
    const { rows } = await db.query('SELECT * FROM vehiculos WHERE id=?', [result.insertId]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ success: false, message: 'Placa ya registrada' });
    res.status(500).json({ success: false, message: 'Error al crear vehículo' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { marca, modelo, anio, color, vin, motor, combustible, km_actual, observaciones } = req.body;
    await db.query(
      `UPDATE vehiculos SET marca=?,modelo=?,anio=?,color=?,vin=?,motor=?,combustible=?,km_actual=?,observaciones=?,updated_at=NOW() WHERE id=?`,
      [marca,modelo,anio,color,vin,motor,combustible,km_actual,observaciones,req.params.id]
    );
    const { rows } = await db.query('SELECT * FROM vehiculos WHERE id=?', [req.params.id]);
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('UPDATE vehiculos SET activo=0 WHERE id=?', [req.params.id]);
    res.json({ success: true, message: 'Vehículo eliminado' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error' });
  }
});

module.exports = router;
