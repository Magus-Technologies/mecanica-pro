// ── tecnicos.js ──────────────────────────────────────────────────────────────
const express = require('express');
const router  = express.Router();
const db      = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
router.use(authMiddleware);

router.get('/', async (_req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT t.*,
             COUNT(ot.id)                   AS ots_activas,
             COALESCE(SUM(ot.total_real),0) AS ingresos_mes
      FROM tecnicos t
      LEFT JOIN ordenes_trabajo ot ON ot.tecnico_id=t.id
        AND ot.estado NOT IN ('cancelado','entregado')
        AND MONTH(ot.created_at)=MONTH(NOW())
      WHERE t.activo=1
      GROUP BY t.id ORDER BY t.nombre
    `);
    res.json({ success:true, data:rows });
  } catch(err){ res.status(500).json({ success:false, message:'Error' }); }
});

router.post('/', async (req, res) => {
  try {
    const { nombre, especialidad, telefono, email, comision_pct=0, salario_base=0 } = req.body;
    if (!nombre) return res.status(400).json({ success:false, message:'Nombre requerido' });
    const [r] = await db.pool.execute(
      `INSERT INTO tecnicos (nombre,especialidad,telefono,email,comision_pct,salario_base) VALUES (?,?,?,?,?,?)`,
      [nombre,especialidad||null,telefono||null,email||null,comision_pct,salario_base]
    );
    const { rows } = await db.query('SELECT * FROM tecnicos WHERE id=?', [r.insertId]);
    res.status(201).json({ success:true, data:rows[0] });
  } catch(err){ res.status(500).json({ success:false, message:'Error' }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { nombre, especialidad, telefono, email, comision_pct, salario_base } = req.body;
    await db.query(
      `UPDATE tecnicos SET nombre=?,especialidad=?,telefono=?,email=?,comision_pct=?,salario_base=?,updated_at=NOW() WHERE id=?`,
      [nombre,especialidad,telefono,email,comision_pct,salario_base,req.params.id]
    );
    const { rows } = await db.query('SELECT * FROM tecnicos WHERE id=?', [req.params.id]);
    res.json({ success:true, data:rows[0] });
  } catch(err){ res.status(500).json({ success:false, message:'Error' }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('UPDATE tecnicos SET activo=0 WHERE id=?', [req.params.id]);
    res.json({ success:true });
  } catch(err){ res.status(500).json({ success:false, message:'Error' }); }
});

module.exports = router;
