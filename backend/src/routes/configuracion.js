// ── configuracion.js ─────────────────────────────────────────────────────────
const express = require('express');
const configRouter = express.Router();
const db = require('../config/database');
const bcrypt = require('bcryptjs');
const { authMiddleware, requireRole } = require('../middleware/auth');
configRouter.use(authMiddleware);

configRouter.get('/', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM taller_config WHERE id=1');
    res.json({ success:true, data: rows[0]||{} });
  } catch(err){ res.status(500).json({ success:false, message:'Error' }); }
});

configRouter.put('/', requireRole('admin','gerente'), async (req, res) => {
  try {
    const { nombre_taller, ruc, telefono, email, direccion, serie_boleta, serie_factura, igv_pct } = req.body;
    await db.query(
      `UPDATE taller_config SET nombre_taller=?,ruc=?,telefono=?,email=?,direccion=?,serie_boleta=?,serie_factura=?,igv_pct=?,updated_at=NOW() WHERE id=1`,
      [nombre_taller,ruc,telefono,email,direccion,serie_boleta,serie_factura,igv_pct||18]
    );
    res.json({ success:true });
  } catch(err){ res.status(500).json({ success:false, message:'Error' }); }
});

configRouter.get('/usuarios', requireRole('admin','gerente'), async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT u.id, u.nombre, u.username, u.email, u.activo, u.ultimo_acceso, r.nombre AS rol
      FROM usuarios u JOIN roles r ON u.rol_id=r.id ORDER BY u.nombre
    `);
    res.json({ success:true, data:rows });
  } catch(err){ res.status(500).json({ success:false, message:'Error' }); }
});

configRouter.post('/usuarios', requireRole('admin'), async (req, res) => {
  try {
    const { nombre, username, email, password, rol_id } = req.body;
    if (!nombre||!username||!password||!rol_id) return res.status(400).json({ success:false, message:'Datos incompletos' });
    const hash = await bcrypt.hash(password, 12);
    const [r] = await db.pool.execute(
      `INSERT INTO usuarios (nombre,username,email,password_hash,rol_id) VALUES (?,?,?,?,?)`,
      [nombre,username,email||null,hash,rol_id]
    );
    res.status(201).json({ success:true, id: r.insertId });
  } catch(err){
    if(err.code==='ER_DUP_ENTRY') return res.status(400).json({ success:false, message:'Usuario ya existe' });
    res.status(500).json({ success:false, message:'Error' });
  }
});

configRouter.get('/roles', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM roles ORDER BY nombre');
    res.json({ success:true, data:rows });
  } catch(err){ res.status(500).json({ success:false, message:'Error' }); }
});

module.exports = configRouter;
