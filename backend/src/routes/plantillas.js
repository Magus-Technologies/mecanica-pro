const express = require('express');
const router  = express.Router();
const db      = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/plantillas/config
router.get('/config', async (_req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM plantilla_config WHERE id = 1');
    res.json({ success: true, data: rows[0] || {} });
  } catch(err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error' });
  }
});

// PUT /api/plantillas/config
router.put('/config', async (req, res) => {
  try {
    const {
      razon_social, ruc, direccion, telefono, email,
      logo_url, mostrar_logo, mostrar_qr,
      mensaje_cabecera, cabecera_activo,
      cuentas_bancarias, mensaje_pie,
      serie_boleta, serie_factura, serie_nota
    } = req.body;

    await db.query(`
      INSERT INTO plantilla_config
        (id, razon_social, ruc, direccion, telefono, email, logo_url,
         mostrar_logo, mostrar_qr, mensaje_cabecera, cabecera_activo,
         cuentas_bancarias, mensaje_pie, serie_boleta, serie_factura, serie_nota)
      VALUES (1,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      ON DUPLICATE KEY UPDATE
        razon_social=VALUES(razon_social), ruc=VALUES(ruc),
        direccion=VALUES(direccion), telefono=VALUES(telefono),
        email=VALUES(email), logo_url=VALUES(logo_url),
        mostrar_logo=VALUES(mostrar_logo), mostrar_qr=VALUES(mostrar_qr),
        mensaje_cabecera=VALUES(mensaje_cabecera), cabecera_activo=VALUES(cabecera_activo),
        cuentas_bancarias=VALUES(cuentas_bancarias), mensaje_pie=VALUES(mensaje_pie),
        serie_boleta=VALUES(serie_boleta), serie_factura=VALUES(serie_factura),
        serie_nota=VALUES(serie_nota), updated_at=NOW()
    `, [razon_social, ruc, direccion, telefono, email, logo_url||null,
        mostrar_logo?1:0, mostrar_qr?1:0, mensaje_cabecera||null, cabecera_activo?1:0,
        cuentas_bancarias||null, mensaje_pie||null,
        serie_boleta||'B001', serie_factura||'F001', serie_nota||'NV01']);

    res.json({ success: true });
  } catch(err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al guardar' });
  }
});

// POST /api/plantillas/upload-logo — subir logo
router.post('/upload-logo', async (req, res) => {
  try {
    const multer  = require('multer');
    const path    = require('path');
    const fs      = require('fs');
    const dir     = path.join(__dirname, '../../uploads/logos');
    fs.mkdirSync(dir, { recursive: true });

    const storage = multer.diskStorage({
      destination: (_req, _file, cb) => cb(null, dir),
      filename:    (_req, file, cb) => cb(null, `logo_${Date.now()}${path.extname(file.originalname)}`),
    });
    const upload = multer({
      storage,
      limits: { fileSize: 2 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        /jpeg|jpg|png|gif|webp/.test(path.extname(file.originalname).toLowerCase())
          ? cb(null, true) : cb(new Error('Solo imágenes'));
      },
    }).single('logo');

    upload(req, res, async (err) => {
      if (err) return res.status(400).json({ success: false, message: err.message });
      if (!req.file) return res.status(400).json({ success: false, message: 'Archivo requerido' });
      const url = `/uploads/logos/${req.file.filename}`;
      res.json({ success: true, url });
    });
  } catch(err) {
    res.status(500).json({ success: false, message: 'Error' });
  }
});

// GET /api/plantillas/comprobante/:id — datos completos para imprimir
router.get('/comprobante/:id', async (req, res) => {
  try {
    const { rows: comp } = await db.query(`
      SELECT cp.*, c.nombre AS cliente_nombre, c.documento AS cliente_doc,
             c.tipo_documento, c.direccion AS cliente_dir, c.telefono AS cliente_tel,
             ot.codigo AS ot_codigo, ot.vehiculo_id
      FROM comprobantes cp
      JOIN clientes c ON cp.cliente_id = c.id
      LEFT JOIN ordenes_trabajo ot ON cp.ot_id = ot.id
      WHERE cp.id = ?
    `, [req.params.id]);

    if (!comp.length) return res.status(404).json({ success: false, message: 'No encontrado' });

    const { rows: detalle } = await db.query(
      'SELECT * FROM comprobantes_detalle WHERE comprobante_id = ?', [req.params.id]
    );
    const { rows: cfg } = await db.query('SELECT * FROM plantilla_config WHERE id = 1');
    const { rows: tcfg } = await db.query('SELECT * FROM taller_config WHERE id = 1');

    res.json({
      success: true,
      data: {
        comprobante: comp[0],
        detalle,
        config: cfg[0] || {},
        taller: tcfg[0] || {},
      }
    });
  } catch(err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error' });
  }
});

module.exports = router;
