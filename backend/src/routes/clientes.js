const express = require('express');
const router  = express.Router();
const db      = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/clientes
router.get('/', async (req, res) => {
  try {
    const { q = '', page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const search = `%${q}%`;

    const { rows } = await db.query(`
      SELECT c.*,
             COUNT(DISTINCT ot.id)          AS total_ots,
             COALESCE(SUM(ot.total_real),0) AS total_gastado
      FROM clientes c
      LEFT JOIN ordenes_trabajo ot ON ot.cliente_id = c.id AND ot.activo=1
      WHERE c.activo=1
        AND (c.nombre LIKE ? OR c.documento LIKE ? OR c.telefono LIKE ?)
      GROUP BY c.id
      ORDER BY c.nombre
      LIMIT ? OFFSET ?
    `, [search, search, search, parseInt(limit), offset]);

    const [cnt] = await db.pool.execute(
      `SELECT COUNT(*) AS total FROM clientes WHERE activo=1 AND (nombre LIKE ? OR documento LIKE ? OR telefono LIKE ?)`,
      [search, search, search]
    );

    res.json({ success: true, data: rows, total: cnt[0].total, page: parseInt(page) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al listar clientes' });
  }
});

// GET /api/clientes/:id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM clientes WHERE id=? AND activo=1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Cliente no encontrado' });

    const { rows: vehiculos } = await db.query('SELECT * FROM vehiculos WHERE cliente_id=? AND activo=1', [req.params.id]);
    const { rows: historial } = await db.query(`
      SELECT ot.*, v.placa, v.marca, v.modelo
      FROM ordenes_trabajo ot JOIN vehiculos v ON ot.vehiculo_id=v.id
      WHERE ot.cliente_id=? ORDER BY ot.created_at DESC LIMIT 20
    `, [req.params.id]);

    res.json({ success: true, data: { ...rows[0], vehiculos, historial } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error' });
  }
});

// POST /api/clientes
router.post('/', async (req, res) => {
  try {
    const { nombre, tipo_documento='DNI', documento, telefono, email, direccion, tipo_cliente='natural', credito_limite=0, notas } = req.body;
    if (!nombre) return res.status(400).json({ success: false, message: 'Nombre requerido' });

    const [result] = await db.pool.execute(
      `INSERT INTO clientes (nombre,tipo_documento,documento,telefono,email,direccion,tipo_cliente,credito_limite,notas)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [nombre, tipo_documento, documento||null, telefono||null, email||null, direccion||null, tipo_cliente, credito_limite, notas||null]
    );
    const { rows } = await db.query('SELECT * FROM clientes WHERE id=?', [result.insertId]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ success: false, message: 'Documento ya registrado' });
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al crear cliente' });
  }
});

// PUT /api/clientes/:id
router.put('/:id', async (req, res) => {
  try {
    const { nombre, tipo_documento, documento, telefono, email, direccion, tipo_cliente, credito_limite, notas } = req.body;
    await db.query(
      `UPDATE clientes SET nombre=?,tipo_documento=?,documento=?,telefono=?,email=?,direccion=?,tipo_cliente=?,credito_limite=?,notas=?,updated_at=NOW()
       WHERE id=? AND activo=1`,
      [nombre, tipo_documento, documento, telefono, email, direccion, tipo_cliente, credito_limite, notas, req.params.id]
    );
    const { rows } = await db.query('SELECT * FROM clientes WHERE id=?', [req.params.id]);
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al actualizar' });
  }
});

// DELETE /api/clientes/:id  (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    await db.query('UPDATE clientes SET activo=0, updated_at=NOW() WHERE id=?', [req.params.id]);
    res.json({ success: true, message: 'Cliente eliminado' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error' });
  }
});

module.exports = router;
