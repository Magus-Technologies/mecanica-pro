/**
 * Runner de migraciones — MecánicaPro
 *
 *   USO:  npm run migrate
 *
 * Aplica los .sql de /migrations/ en orden alfabético, una sola vez,
 * llevando control en la tabla `_migrations`.
 */
require('dotenv').config();
const fs    = require('fs');
const path  = require('path');
const mysql = require('mysql2/promise');

(async () => {
  // Pool dedicado con multipleStatements para que un .sql pueda contener varios statements.
  const pool = mysql.createPool({
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT) || 3306,
    database: process.env.DB_NAME     || 'mecanica_pro',
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
    connectionLimit: 1,
    timezone: '-05:00',
    charset: 'utf8mb4',
  });

  const dir = path.resolve(__dirname, '../../../migrations');
  if (!fs.existsSync(dir)) { console.log('No existe carpeta /migrations'); await pool.end(); process.exit(0); }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      archivo VARCHAR(255) NOT NULL UNIQUE,
      ejecutada_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  // Migraciones previas pueden haber sido aplicadas manualmente (mysql < archivo.sql).
  // Si la tabla `rol_permisos` ya existe y no está registrada, registramos la migración
  // del 2026-04-25 como aplicada para no reintentarla.
  const [tblRP]  = await pool.query("SHOW TABLES LIKE 'rol_permisos'");
  const [regRP]  = await pool.query("SELECT 1 FROM _migrations WHERE archivo='2026-04-25-roles-whatsapp.sql'");
  if (tblRP.length > 0 && regRP.length === 0) {
    await pool.query("INSERT IGNORE INTO _migrations (archivo) VALUES ('2026-04-25-roles-whatsapp.sql')");
  }

  const [aplicadasRows] = await pool.query('SELECT archivo FROM _migrations');
  const ya = new Set(aplicadasRows.map(r => r.archivo));

  const archivos = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort();
  if (archivos.length === 0) { console.log('No hay archivos .sql'); await pool.end(); process.exit(0); }

  let n = 0;
  for (const archivo of archivos) {
    if (ya.has(archivo)) { console.log(`•  ${archivo}   (ya aplicada)`); continue; }
    const sql = fs.readFileSync(path.join(dir, archivo), 'utf8');
    try {
      await pool.query(sql);
      await pool.query('INSERT INTO _migrations (archivo) VALUES (?)', [archivo]);
      console.log(`OK ${archivo}`);
      n++;
    } catch (err) {
      console.error(`ERR ${archivo}: ${err.message}`);
      await pool.end();
      process.exit(1);
    }
  }

  console.log(`\n${n} migración(es) aplicada(s).`);
  await pool.end();
  process.exit(0);
})();
