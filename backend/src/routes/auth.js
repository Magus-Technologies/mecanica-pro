const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const db       = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ success: false, message: 'Usuario y contraseña requeridos' });

    const { rows } = await db.query(
      `SELECT u.*, r.nombre AS rol_nombre
       FROM usuarios u JOIN roles r ON u.rol_id = r.id
       WHERE u.username = ? AND u.activo = 1 LIMIT 1`,
      [username]
    );
    if (!rows.length)
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });

    const user  = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid)
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.rol_nombre, nombre: user.nombre },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    await db.query('UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = ?', [user.id]);

    res.json({
      success: true, token,
      user: { id: user.id, nombre: user.nombre, username: user.username, role: user.rol_nombre },
    });
  } catch (err) {
    console.error('login:', err);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT u.id, u.nombre, u.username, u.email, r.nombre AS role
       FROM usuarios u JOIN roles r ON u.rol_id = r.id WHERE u.id = ?`,
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'No encontrado' });
    res.json({ success: true, user: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error' });
  }
});

// POST /api/auth/change-password
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    const { rows } = await db.query('SELECT password_hash FROM usuarios WHERE id = ?', [req.user.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'No encontrado' });

    if (!await bcrypt.compare(current_password, rows[0].password_hash))
      return res.status(400).json({ success: false, message: 'Contraseña actual incorrecta' });

    const hash = await bcrypt.hash(new_password, 12);
    await db.query('UPDATE usuarios SET password_hash = ? WHERE id = ?', [hash, req.user.id]);
    res.json({ success: true, message: 'Contraseña actualizada' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error' });
  }
});

module.exports = router;
