const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const rateLimit  = require('express-rate-limit');
const path       = require('path');
require('dotenv').config();

const app = express();

/* ── Seguridad ──────────────────────────────────────────────────────────── */
app.use(helmet({ contentSecurityPolicy: false }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }));

/* ── CORS ───────────────────────────────────────────────────────────────── */
app.use(cors({
  origin: [
    process.env.CORS_ORIGIN || 'https://magus-ecommerce.com',
    'http://localhost:3000',
    'http://localhost:5500',
  ],
  methods: ['GET','POST','PUT','DELETE','PATCH'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true,
}));

/* ── Parsers ────────────────────────────────────────────────────────────── */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/* ── Logs ───────────────────────────────────────────────────────────────── */
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

/* ── Estáticos ──────────────────────────────────────────────────────────── */
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(express.static(path.join(__dirname, '../../frontend')));

/* ── Rutas API ──────────────────────────────────────────────────────────── */
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/dashboard',  require('./routes/dashboard'));
app.use('/api/clientes',   require('./routes/clientes'));
app.use('/api/vehiculos',  require('./routes/vehiculos'));
app.use('/api/ots',        require('./routes/ordenesTrabajo'));
app.use('/api/servicios',  require('./routes/servicios'));
app.use('/api/repuestos',  require('./routes/repuestos'));
app.use('/api/tecnicos',   require('./routes/tecnicos'));
app.use('/api/ventas',     require('./routes/ventas'));
app.use('/api/caja',       require('./routes/caja'));
app.use('/api/compras',    require('./routes/compras'));
app.use('/api/reportes',   require('./routes/reportes'));
app.use('/api/config',     require('./routes/configuracion'));
app.use('/api/uploads',    require('./routes/uploads'));
app.use('/api/roles',      require('./routes/roles'));
app.use('/api/whatsapp',   require('./routes/whatsapp'));
app.use('/api/portal',     require('./routes/portal'));

/* ── SPA fallback ───────────────────────────────────────────────────────── */
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/index.html'));
});

/* ── Error handler ──────────────────────────────────────────────────────── */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

/* ── Start ──────────────────────────────────────────────────────────────── */
const PORT = parseInt(process.env.PORT) || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅  MecánicaPro en puerto ${PORT}  [${process.env.NODE_ENV}]`);
});

module.exports = app;
