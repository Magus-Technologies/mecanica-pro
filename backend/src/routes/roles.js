const express = require('express');
const router  = express.Router();
const db      = require('../config/database');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/roles
router.get('/', async (_req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM roles ORDER BY id');
    res.json({ success: true, data: rows });
  } catch(err) {
    res.status(500).json({ success: false, message: 'Error' });
  }
});

// GET /api/roles/mis-permisos  ← DEBE IR ANTES DE /:id
router.get('/mis-permisos', async (req, res) => {
  try {
    const { rows: roleRows } = await db.query(
      'SELECT id FROM roles WHERE nombre = ? LIMIT 1', [req.user.role]
    );
    if (!roleRows.length) return res.json({ success: true, data: {} });

    const { rows } = await db.query(
      'SELECT * FROM rol_permisos WHERE rol_id = ?', [roleRows[0].id]
    );
    const permisos = {};
    rows.forEach(r => {
      permisos[r.modulo] = {
        ver:      !!r.ver,
        crear:    !!r.crear,
        editar:   !!r.editar,
        eliminar: !!r.eliminar,
      };
    });
    res.json({ success: true, data: permisos });
  } catch(err) {
    console.error('mis-permisos error:', err);
    res.status(500).json({ success: false, message: 'Error' });
  }
});

// GET /api/roles/:id/permisos
router.get('/:id/permisos', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM rol_permisos WHERE rol_id = ?', [req.params.id]
    );
    const permisos = {};
    rows.forEach(r => {
      permisos[r.modulo] = {
        ver:      !!r.ver,
        crear:    !!r.crear,
        editar:   !!r.editar,
        eliminar: !!r.eliminar,
      };
    });
    res.json({ success: true, data: permisos });
  } catch(err) {
    res.status(500).json({ success: false, message: 'Error' });
  }
});

// PUT /api/roles/:id/permisos
router.put('/:id/permisos', requireRole('admin'), async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const { permisos } = req.body;
    await conn.execute('DELETE FROM rol_permisos WHERE rol_id = ?', [req.params.id]);
    for (const [modulo, p] of Object.entries(permisos)) {
      await conn.execute(
        `INSERT INTO rol_permisos (rol_id, modulo, ver, crear, editar, eliminar)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [req.params.id, modulo, p.ver?1:0, p.crear?1:0, p.editar?1:0, p.eliminar?1:0]
      );
    }
    await conn.commit();
    res.json({ success: true, message: 'Permisos guardados' });
  } catch(err) {
    await conn.rollback();
    res.status(500).json({ success: false, message: 'Error al guardar permisos' });
  } finally {
    conn.release();
  }
});

module.exports = router;
