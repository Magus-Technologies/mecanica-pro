const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const db      = require('../config/database');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.use(authMiddleware);

/* ── GET / — listar técnicos con stats ─────────────────────────────────── */
router.get('/', async (_req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT t.*,
             u.username, u.activo AS usuario_activo,
             COUNT(DISTINCT ot.id)          AS ots_activas,
             COALESCE(SUM(ot.total_real),0) AS ingresos_mes
      FROM tecnicos t
      LEFT JOIN usuarios u ON u.id = t.usuario_id
      LEFT JOIN ordenes_trabajo ot ON ot.tecnico_id = t.id
        AND ot.estado NOT IN ('cancelado','entregado')
        AND MONTH(ot.created_at) = MONTH(NOW())
        AND YEAR(ot.created_at)  = YEAR(NOW())
      WHERE t.activo = 1
      GROUP BY t.id
      ORDER BY t.nombre
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al listar técnicos' });
  }
});

/* ── POST / — crear técnico + usuario automáticamente ──────────────────── */
router.post('/', requireRole('admin','gerente','recepcion'), async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const {
      nombre, especialidad, telefono, email,
      comision_pct = 0, salario_base = 0,
      username, password
    } = req.body;

    if (!nombre)    return res.status(400).json({ success: false, message: 'Nombre requerido' });
    if (!username)  return res.status(400).json({ success: false, message: 'Usuario requerido' });
    if (!password)  return res.status(400).json({ success: false, message: 'Contraseña requerida' });

    // Obtener rol "tecnico"
    const [roles] = await conn.execute(`SELECT id FROM roles WHERE nombre='tecnico' LIMIT 1`);
    if (!roles.length) throw new Error('Rol técnico no encontrado');
    const rol_id = roles[0].id;

    // Crear usuario
    const hash = await bcrypt.hash(password, 12);
    const [uResult] = await conn.execute(
      `INSERT INTO usuarios (rol_id, nombre, username, email, password_hash) VALUES (?,?,?,?,?)`,
      [rol_id, nombre, username, email || null, hash]
    );
    const usuario_id = uResult.insertId;

    // Crear técnico vinculado al usuario
    const [tResult] = await conn.execute(
      `INSERT INTO tecnicos (nombre, especialidad, telefono, email, comision_pct, salario_base, usuario_id)
       VALUES (?,?,?,?,?,?,?)`,
      [nombre, especialidad || null, telefono || null, email || null, comision_pct, salario_base, usuario_id]
    );

    await conn.commit();

    const { rows } = await db.query(`
      SELECT t.*, u.username FROM tecnicos t
      LEFT JOIN usuarios u ON u.id = t.usuario_id
      WHERE t.id = ?`, [tResult.insertId]);

    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    await conn.rollback();
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(400).json({ success: false, message: 'El nombre de usuario ya existe' });
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al crear técnico' });
  } finally {
    conn.release();
  }
});

/* ── PUT /:id — editar técnico (y opcionalmente cambiar password) ────────── */
router.put('/:id', requireRole('admin','gerente'), async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const { nombre, especialidad, telefono, email, comision_pct, salario_base, password } = req.body;

    // Actualizar técnico
    await conn.execute(
      `UPDATE tecnicos SET nombre=?,especialidad=?,telefono=?,email=?,comision_pct=?,salario_base=?,updated_at=NOW()
       WHERE id=?`,
      [nombre, especialidad, telefono, email, comision_pct, salario_base, req.params.id]
    );

    // Actualizar nombre en usuario vinculado
    await conn.execute(
      `UPDATE usuarios u
       JOIN tecnicos t ON t.usuario_id = u.id
       SET u.nombre = ?, u.email = ?
       WHERE t.id = ?`,
      [nombre, email || null, req.params.id]
    );

    // Si vino nueva contraseña, cambiarla
    if (password && password.trim().length >= 6) {
      const hash = await bcrypt.hash(password, 12);
      await conn.execute(
        `UPDATE usuarios u
         JOIN tecnicos t ON t.usuario_id = u.id
         SET u.password_hash = ?
         WHERE t.id = ?`,
        [hash, req.params.id]
      );
    }

    await conn.commit();

    const { rows } = await db.query(`
      SELECT t.*, u.username FROM tecnicos t
      LEFT JOIN usuarios u ON u.id = t.usuario_id
      WHERE t.id = ?`, [req.params.id]);

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al actualizar' });
  } finally {
    conn.release();
  }
});

/* ── DELETE /:id — desactivar técnico y su usuario ──────────────────────── */
router.delete('/:id', requireRole('admin'), async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.execute(`UPDATE tecnicos SET activo=0 WHERE id=?`, [req.params.id]);
    await conn.execute(
      `UPDATE usuarios u JOIN tecnicos t ON t.usuario_id=u.id SET u.activo=0 WHERE t.id=?`,
      [req.params.id]
    );
    await conn.commit();
    res.json({ success: true });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ success: false, message: 'Error' });
  } finally {
    conn.release();
  }
});

module.exports = router;
