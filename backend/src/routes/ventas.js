const express = require('express');
const router  = express.Router();
const db      = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const { page=1, limit=20, tipo, q='' } = req.query;
    const offset = (parseInt(page)-1)*parseInt(limit);
    const search = `%${q}%`;
    let where = `cp.anulado=0 AND (cp.serie_numero LIKE ? OR c.nombre LIKE ?)`;
    const params = [search, search];
    if (tipo) { where += ' AND cp.tipo=?'; params.push(tipo); }
    params.push(parseInt(limit), offset);

    const { rows } = await db.query(`
      SELECT cp.*, c.nombre AS cliente, c.documento AS cliente_doc
      FROM comprobantes cp JOIN clientes c ON cp.cliente_id=c.id
      WHERE ${where}
      ORDER BY cp.fecha_emision DESC LIMIT ? OFFSET ?
    `, params);
    res.json({ success:true, data:rows });
  } catch(err){ res.status(500).json({ success:false, message:'Error' }); }
});

router.post('/', async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const { cliente_id, ot_id, tipo='boleta', metodo_pago='efectivo', items=[], descuento=0 } = req.body;
    if (!cliente_id || !items.length) return res.status(400).json({ success:false, message:'Datos insuficientes' });

    // Calcular serie y correlativo
    const [cfg] = await conn.execute('SELECT * FROM taller_config WHERE id=1');
    const config = cfg[0];
    let serie, correlativo;
    if (tipo === 'boleta')  { serie = config.serie_boleta  || 'B001'; correlativo = (config.correlativo_boleta ||0)+1; await conn.execute('UPDATE taller_config SET correlativo_boleta=? WHERE id=1', [correlativo]); }
    if (tipo === 'factura') { serie = config.serie_factura || 'F001'; correlativo = (config.correlativo_factura||0)+1; await conn.execute('UPDATE taller_config SET correlativo_factura=? WHERE id=1', [correlativo]); }
    if (tipo === 'nota_venta') { serie = 'NV01'; correlativo = (config.correlativo_nota||0)+1; await conn.execute('UPDATE taller_config SET correlativo_nota=? WHERE id=1', [correlativo]); }
    const serie_numero = `${serie}-${String(correlativo).padStart(8,'0')}`;

    let subtotal = 0;
    for (const i of items) subtotal += parseFloat(i.precio_unitario) * parseInt(i.cantidad);
    subtotal -= parseFloat(descuento);
    const igv = tipo === 'nota_venta' ? 0 : subtotal * 0.18;
    const total = subtotal + igv;

    const [result] = await conn.execute(
      `INSERT INTO comprobantes (cliente_id,ot_id,tipo,serie_numero,serie,correlativo,metodo_pago,subtotal,igv,descuento,total,fecha_emision,usuario_id)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,NOW(),?)`,
      [cliente_id,ot_id||null,tipo,serie_numero,serie,correlativo,metodo_pago,subtotal,igv,descuento,total,req.user.id]
    );
    const comp_id = result.insertId;

    for (const i of items) {
      await conn.execute(
        `INSERT INTO comprobantes_detalle (comprobante_id,descripcion,cantidad,precio_unitario,subtotal) VALUES (?,?,?,?,?)`,
        [comp_id, i.descripcion, i.cantidad, i.precio_unitario, parseFloat(i.precio_unitario)*parseInt(i.cantidad)]
      );
    }

    // Actualizar OT a facturado si viene de OT
    if (ot_id) {
      await conn.execute(`UPDATE ordenes_trabajo SET estado='facturado',total_real=?,updated_at=NOW() WHERE id=?`, [total, ot_id]);
    }

    await conn.commit();
    const { rows } = await db.query('SELECT * FROM comprobantes WHERE id=?', [comp_id]);
    res.status(201).json({ success:true, data:rows[0], serie_numero });
  } catch(err){
    await conn.rollback();
    console.error(err);
    res.status(500).json({ success:false, message:'Error al emitir comprobante' });
  } finally { conn.release(); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('UPDATE comprobantes SET anulado=1, updated_at=NOW() WHERE id=?', [req.params.id]);
    res.json({ success:true, message:'Comprobante anulado' });
  } catch(err){ res.status(500).json({ success:false, message:'Error' }); }
});

module.exports = router;
