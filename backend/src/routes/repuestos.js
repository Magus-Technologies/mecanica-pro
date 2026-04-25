const express = require('express');
const router  = express.Router();
const db      = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const { q='', alerta, page=1, limit=50 } = req.query;
    const offset = (parseInt(page)-1)*parseInt(limit);
    const search = `%${q}%`;
    let where = `r.activo=1 AND (r.nombre LIKE ? OR r.sku LIKE ?)`;
    const params = [search, search];
    if (alerta === '1') { where += ' AND r.stock_actual <= r.stock_minimo'; }
    params.push(parseInt(limit), offset);

    const { rows } = await db.query(`
      SELECT r.*, cr.nombre AS categoria_nombre,
             CASE WHEN r.stock_actual=0 THEN 'sin_stock'
                  WHEN r.stock_actual <= r.stock_minimo THEN 'critico'
                  ELSE 'ok' END AS estado_stock
      FROM repuestos r LEFT JOIN categorias_repuesto cr ON r.categoria_id=cr.id
      WHERE ${where}
      ORDER BY r.nombre LIMIT ? OFFSET ?
    `, params);

    res.json({ success:true, data:rows });
  } catch(err){ res.status(500).json({ success:false, message:'Error' }); }
});

router.get('/:id/kardex', async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT k.*, u.nombre AS usuario_nombre
      FROM kardex k LEFT JOIN usuarios u ON k.usuario_id=u.id
      WHERE k.repuesto_id=? ORDER BY k.created_at DESC LIMIT 50
    `, [req.params.id]);
    res.json({ success:true, data:rows });
  } catch(err){ res.status(500).json({ success:false, message:'Error' }); }
});

router.post('/', async (req, res) => {
  try {
    const { nombre, sku, categoria_id, marca, unidad='und', precio_compra=0, precio_venta=0, stock_actual=0, stock_minimo=5, stock_maximo=100, ubicacion, descripcion } = req.body;
    if (!nombre) return res.status(400).json({ success:false, message:'Nombre requerido' });
    const [r] = await db.pool.execute(
      `INSERT INTO repuestos (nombre,sku,categoria_id,marca,unidad,precio_compra,precio_venta,stock_actual,stock_minimo,stock_maximo,ubicacion,descripcion)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [nombre,sku||null,categoria_id||null,marca||null,unidad,precio_compra,precio_venta,stock_actual,stock_minimo,stock_maximo,ubicacion||null,descripcion||null]
    );
    const { rows } = await db.query('SELECT * FROM repuestos WHERE id=?', [r.insertId]);
    res.status(201).json({ success:true, data:rows[0] });
  } catch(err){
    if(err.code==='ER_DUP_ENTRY') return res.status(400).json({ success:false, message:'SKU duplicado' });
    res.status(500).json({ success:false, message:'Error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { nombre, sku, categoria_id, marca, unidad, precio_compra, precio_venta, stock_minimo, stock_maximo, ubicacion, descripcion } = req.body;
    await db.query(
      `UPDATE repuestos SET nombre=?,sku=?,categoria_id=?,marca=?,unidad=?,precio_compra=?,precio_venta=?,stock_minimo=?,stock_maximo=?,ubicacion=?,descripcion=?,updated_at=NOW() WHERE id=?`,
      [nombre,sku,categoria_id,marca,unidad,precio_compra,precio_venta,stock_minimo,stock_maximo,ubicacion,descripcion,req.params.id]
    );
    const { rows } = await db.query('SELECT * FROM repuestos WHERE id=?', [req.params.id]);
    res.json({ success:true, data:rows[0] });
  } catch(err){ res.status(500).json({ success:false, message:'Error' }); }
});

// Ajuste de stock manual
router.post('/:id/ajuste', async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const { cantidad, tipo, descripcion } = req.body; // tipo: entrada|ajuste
    const [rep] = await conn.execute('SELECT stock_actual FROM repuestos WHERE id=?', [req.params.id]);
    if (!rep.length) return res.status(404).json({ success:false, message:'No encontrado' });

    const stock_ant = rep[0].stock_actual;
    const nuevo = tipo === 'entrada' ? stock_ant + parseInt(cantidad) : parseInt(cantidad);
    await conn.execute('UPDATE repuestos SET stock_actual=?, updated_at=NOW() WHERE id=?', [nuevo, req.params.id]);
    await conn.execute(
      `INSERT INTO kardex (repuesto_id,tipo,cantidad,stock_anterior,stock_nuevo,descripcion,usuario_id) VALUES (?,?,?,?,?,?,?)`,
      [req.params.id, tipo, Math.abs(nuevo - stock_ant), stock_ant, nuevo, descripcion||'Ajuste manual', req.user.id]
    );
    await conn.commit();
    res.json({ success:true, message:'Stock actualizado', nuevo_stock: nuevo });
  } catch(err){
    await conn.rollback();
    res.status(500).json({ success:false, message:'Error' });
  } finally { conn.release(); }
});

module.exports = router;
