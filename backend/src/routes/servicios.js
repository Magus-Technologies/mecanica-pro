// ============================================================
//  routes/servicios.js
// ============================================================
const express = require('express');
const router  = express.Router();
const db      = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT s.*, cs.nombre AS categoria_nombre
      FROM servicios s LEFT JOIN categorias_servicio cs ON s.categoria_id=cs.id
      WHERE s.activo=1 ORDER BY cs.nombre, s.nombre
    `);
    res.json({ success:true, data:rows });
  } catch(err){ res.status(500).json({ success:false, message:'Error' }); }
});

router.post('/', async (req, res) => {
  try {
    const { nombre, categoria_id, precio, costo_mo=0, tiempo_estimado=60, descripcion } = req.body;
    if (!nombre || !precio) return res.status(400).json({ success:false, message:'Nombre y precio requeridos' });
    const [r] = await db.pool.execute(
      `INSERT INTO servicios (nombre,categoria_id,precio,costo_mo,tiempo_estimado,descripcion) VALUES (?,?,?,?,?,?)`,
      [nombre,categoria_id||null,precio,costo_mo,tiempo_estimado,descripcion||null]
    );
    const { rows } = await db.query('SELECT * FROM servicios WHERE id=?', [r.insertId]);
    res.status(201).json({ success:true, data:rows[0] });
  } catch(err){ res.status(500).json({ success:false, message:'Error' }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { nombre, categoria_id, precio, costo_mo, tiempo_estimado, descripcion } = req.body;
    await db.query(`UPDATE servicios SET nombre=?,categoria_id=?,precio=?,costo_mo=?,tiempo_estimado=?,descripcion=?,updated_at=NOW() WHERE id=?`,
      [nombre,categoria_id,precio,costo_mo,tiempo_estimado,descripcion,req.params.id]);
    const { rows } = await db.query('SELECT * FROM servicios WHERE id=?', [req.params.id]);
    res.json({ success:true, data:rows[0] });
  } catch(err){ res.status(500).json({ success:false, message:'Error' }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('UPDATE servicios SET activo=0 WHERE id=?', [req.params.id]);
    res.json({ success:true });
  } catch(err){ res.status(500).json({ success:false, message:'Error' }); }
});

module.exports = router;
