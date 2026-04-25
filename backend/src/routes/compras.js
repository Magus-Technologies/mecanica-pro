// ── compras.js ───────────────────────────────────────────────────────────────
const express = require('express');
const comprasRouter = express.Router();
const db = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
comprasRouter.use(authMiddleware);

comprasRouter.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT oc.*, p.nombre AS proveedor_nombre
      FROM ordenes_compra oc LEFT JOIN proveedores p ON oc.proveedor_id=p.id
      ORDER BY oc.created_at DESC LIMIT 50
    `);
    res.json({ success:true, data:rows });
  } catch(err){ res.status(500).json({ success:false, message:'Error' }); }
});

comprasRouter.post('/', async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const { proveedor_id, items=[], notas } = req.body;
    if (!items.length) return res.status(400).json({ success:false, message:'Sin items' });

    let total = 0;
    for (const i of items) total += parseFloat(i.precio_unitario)*parseInt(i.cantidad);

    const [r] = await conn.execute(
      `INSERT INTO ordenes_compra (proveedor_id,total,estado,notas,usuario_id) VALUES (?,?,'recibida',?,?)`,
      [proveedor_id||null, total, notas||null, req.user.id]
    );
    const oc_id = r.insertId;

    for (const i of items) {
      await conn.execute(
        `INSERT INTO ordenes_compra_detalle (oc_id,repuesto_id,cantidad,precio_unitario) VALUES (?,?,?,?)`,
        [oc_id, i.repuesto_id, i.cantidad, i.precio_unitario]
      );
      // Actualizar stock
      const [rep] = await conn.execute('SELECT stock_actual FROM repuestos WHERE id=?', [i.repuesto_id]);
      if (rep.length) {
        const nuevo = rep[0].stock_actual + parseInt(i.cantidad);
        await conn.execute('UPDATE repuestos SET stock_actual=?,precio_compra=?,updated_at=NOW() WHERE id=?', [nuevo, i.precio_unitario, i.repuesto_id]);
        await conn.execute(
          `INSERT INTO kardex (repuesto_id,tipo,cantidad,stock_anterior,stock_nuevo,referencia,descripcion,usuario_id)
           VALUES (?,'entrada',?,?,?,?,?,?)`,
          [i.repuesto_id, i.cantidad, rep[0].stock_actual, nuevo, `OC-${oc_id}`, 'Compra', req.user.id]
        );
      }
    }
    await conn.commit();
    res.status(201).json({ success:true, id:oc_id });
  } catch(err){
    await conn.rollback();
    res.status(500).json({ success:false, message:'Error' });
  } finally { conn.release(); }
});

comprasRouter.get('/proveedores', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM proveedores WHERE activo=1 ORDER BY nombre');
    res.json({ success:true, data:rows });
  } catch(err){ res.status(500).json({ success:false, message:'Error' }); }
});

comprasRouter.post('/proveedores', async (req, res) => {
  try {
    const { nombre, ruc, telefono, email, direccion } = req.body;
    const [r] = await db.pool.execute(
      `INSERT INTO proveedores (nombre,ruc,telefono,email,direccion) VALUES (?,?,?,?,?)`,
      [nombre,ruc||null,telefono||null,email||null,direccion||null]
    );
    const { rows } = await db.query('SELECT * FROM proveedores WHERE id=?', [r.insertId]);
    res.status(201).json({ success:true, data:rows[0] });
  } catch(err){ res.status(500).json({ success:false, message:'Error' }); }
});

module.exports = comprasRouter;
