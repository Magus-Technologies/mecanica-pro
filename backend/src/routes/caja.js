// ── caja.js ─────────────────────────────────────────────────────────────────
const express = require('express');
const cajaRouter = express.Router();
const db = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
cajaRouter.use(authMiddleware);

cajaRouter.get('/sesion-activa', async (req, res) => {
  try {
    const { rows } = await db.query(`SELECT * FROM caja_sesiones WHERE estado='abierta' AND usuario_id=? LIMIT 1`, [req.user.id]);
    res.json({ success:true, data: rows[0]||null });
  } catch(err){ res.status(500).json({ success:false, message:'Error' }); }
});

cajaRouter.post('/abrir', async (req, res) => {
  try {
    const { monto_apertura=0 } = req.body;
    const [r] = await db.pool.execute(
      `INSERT INTO caja_sesiones (usuario_id,monto_apertura,estado) VALUES (?,?,'abierta')`,
      [req.user.id, monto_apertura]
    );
    const { rows } = await db.query('SELECT * FROM caja_sesiones WHERE id=?', [r.insertId]);
    res.json({ success:true, data:rows[0] });
  } catch(err){ res.status(500).json({ success:false, message:'Error' }); }
});

cajaRouter.post('/cerrar/:sesion_id', async (req, res) => {
  try {
    const { monto_cierre } = req.body;
    await db.query(
      `UPDATE caja_sesiones SET monto_cierre=?,estado='cerrada',fecha_cierre=NOW() WHERE id=?`,
      [monto_cierre, req.params.sesion_id]
    );
    res.json({ success:true });
  } catch(err){ res.status(500).json({ success:false, message:'Error' }); }
});

cajaRouter.get('/movimientos', async (req, res) => {
  try {
    const { fecha } = req.query;
    const f = fecha || new Date().toISOString().split('T')[0];
    const { rows } = await db.query(
      `SELECT * FROM caja_movimientos WHERE DATE(created_at)=? ORDER BY created_at DESC`, [f]
    );
    res.json({ success:true, data:rows });
  } catch(err){ res.status(500).json({ success:false, message:'Error' }); }
});

cajaRouter.post('/movimiento', async (req, res) => {
  try {
    const { sesion_id, tipo, monto, descripcion, metodo_pago='efectivo' } = req.body;
    const [r] = await db.pool.execute(
      `INSERT INTO caja_movimientos (sesion_id,tipo,monto,descripcion,metodo_pago,usuario_id) VALUES (?,?,?,?,?,?)`,
      [sesion_id, tipo, monto, descripcion, metodo_pago, req.user.id]
    );
    res.json({ success:true, id: r.insertId });
  } catch(err){ res.status(500).json({ success:false, message:'Error' }); }
});

module.exports = cajaRouter;
