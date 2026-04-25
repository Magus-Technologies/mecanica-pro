const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const db      = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const dir = path.join(__dirname, '../../uploads', req.body.tipo || 'general');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext  = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random()*1e6)}${ext}`;
    cb(null, name);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp|mp4|mov|pdf/;
  cb(null, allowed.test(path.extname(file.originalname).toLowerCase()));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 },
});

// POST /api/uploads/evidencia  (campo: archivo)
router.post('/evidencia', upload.single('archivo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success:false, message:'Archivo requerido' });
    const { ot_id, descripcion } = req.body;
    const url = `/uploads/${req.body.tipo||'general'}/${req.file.filename}`;
    const tipo_archivo = req.file.mimetype.startsWith('video') ? 'video' : 'foto';

    if (ot_id) {
      await db.query(
        `INSERT INTO ot_evidencias (ot_id,tipo,url,descripcion,usuario_id) VALUES (?,?,?,?,?)`,
        [ot_id, tipo_archivo, url, descripcion||null, req.user.id]
      );
    }
    res.json({ success:true, url, filename: req.file.filename });
  } catch(err){
    console.error(err);
    res.status(500).json({ success:false, message:'Error al subir archivo' });
  }
});

module.exports = router;
